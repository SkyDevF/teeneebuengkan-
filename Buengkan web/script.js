// Global state
let currentCategory = 'all';
let allDestinations = [];
let currentPage = 1;
const itemsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    setupNavigation();
    setupSlideshow();
    setupTabs();
    await loadAllDestinations();
    loadWeatherInfo();
    setupPageTransitions();
}

function setupNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    // Toggle mobile menu
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });

        // Handle navigation clicks
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Close mobile menu
                if (navList.classList.contains('active')) {
                    navList.classList.remove('active');
                }

                const href = link.getAttribute('href');
                const category = link.getAttribute('data-category');

                if (href.startsWith('#')) {
                    if (category) {
                        showCategoryPage(category, href.substring(1));
                    } else {
                        showSection(href.substring(1));
                    }
                }
            });
        });
    }
}

function setupSlideshow() {
    const backgroundSlides = document.querySelectorAll('.hero-background-slideshow');
    const imageFiles = ['1.png', '2.png', '3.png', '4.png'];
    let currentSlide = 0;

    // Set background images
    backgroundSlides.forEach((slide, index) => {
        if (imageFiles[index]) {
            slide.style.backgroundImage = `url('${imageFiles[index]}')`;
        }
    });

    function showSlide(index) {
        backgroundSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % backgroundSlides.length;
        showSlide(currentSlide);
    }

    if (backgroundSlides.length > 0) {
        showSlide(currentSlide);
        setInterval(nextSlide, 5000);
    }
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const loadMoreBtn = document.getElementById('load-more');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Load category content
            const category = btn.getAttribute('data-category');
            currentCategory = category;
            currentPage = 1;
            displayDestinations(category);
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            displayDestinations(currentCategory, true);
        });
    }
}

async function loadAllDestinations() {
    try {
        // Load all categories
        const [attractions, cafes, accommodations, restaurants] = await Promise.all([
            buengkanAPI.getAttractions(),
            buengkanAPI.getCafes(),
            buengkanAPI.getAccommodations(),
            buengkanAPI.getRestaurants()
        ]);

        allDestinations = [...attractions, ...cafes, ...accommodations, ...restaurants];
        
        // Display initial content
        displayDestinations('all');
        
    } catch (error) {
        console.error('Error loading destinations:', error);
        showErrorMessage();
    }
}

function displayDestinations(category, append = false) {
    const grid = document.getElementById('destination-grid');
    if (!grid) return;

    let filteredDestinations = allDestinations;
    
    if (category !== 'all') {
        filteredDestinations = allDestinations.filter(dest => dest.category === category);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const destinationsToShow = filteredDestinations.slice(0, endIndex);

    if (!append) {
        grid.innerHTML = '';
    }

    if (destinationsToShow.length === 0) {
        grid.innerHTML = '<div class="no-results">ไม่พบข้อมูลในหมวดหมู่นี้</div>';
        return;
    }

    const newDestinations = filteredDestinations.slice(startIndex, endIndex);
    const cardsHTML = newDestinations.map(dest => createDestinationCard(dest)).join('');
    
    if (append) {
        grid.insertAdjacentHTML('beforeend', cardsHTML);
    } else {
        grid.innerHTML = cardsHTML;
    }

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = endIndex >= filteredDestinations.length ? 'none' : 'block';
    }

    // Trigger animations
    setTimeout(() => {
        const newCards = grid.querySelectorAll('.destination-card:not(.animated)');
        newCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated', 'page-transition', 'active');
            }, index * 100);
        });
    }, 100);
}

function createDestinationCard(destination) {
    const priceDisplay = destination.price ? `<span class="price">${destination.price}</span>` : '';
    
    return `
        <div class="destination-card">
            <div class="card-image">
                <img src="${destination.image}" alt="${destination.title}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(destination.title)}'">
                <div class="card-overlay">
                    <button class="btn btn-secondary" onclick="showDestinationDetail(${destination.id})">
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
            <div class="card-content">
                <h3>${destination.title}</h3>
                <p>${destination.description}</p>
                <div class="card-footer">
                    <div class="rating">
                        ${'★'.repeat(Math.floor(destination.rating))}
                        <span>${destination.rating}</span>
                    </div>
                    ${priceDisplay}
                </div>
            </div>
        </div>
    `;
}

async function showCategoryPage(category, sectionId) {
    // Hide all dynamic sections
    hideAllDynamicSections();
    
    // Show target section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        const grid = section.querySelector('.destination-grid');
        
        if (grid) {
            grid.innerHTML = '<div class="loading">กำลังโหลดข้อมูล...</div>';
            
            // Get category data
            let destinations = [];
            switch(category) {
                case 'attraction':
                    destinations = await buengkanAPI.getAttractions();
                    break;
                case 'cafe':
                    destinations = await buengkanAPI.getCafes();
                    break;
                case 'accommodation':
                    destinations = await buengkanAPI.getAccommodations();
                    break;
                case 'restaurant':
                    destinations = await buengkanAPI.getRestaurants();
                    break;
            }
            
            grid.innerHTML = destinations.map(dest => createDestinationCard(dest)).join('');
            
            // Trigger animations
            setTimeout(() => {
                grid.querySelectorAll('.destination-card').forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('page-transition', 'active');
                    }, index * 100);
                });
            }, 100);
        }
        
        // Smooth scroll to section
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showSection(sectionId) {
    if (sectionId === 'featured') {
        hideAllDynamicSections();
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideAllDynamicSections() {
    const sections = ['attractions', 'cafes', 'accommodations', 'restaurants'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
}

function showDestinationDetail(id) {
    const destination = allDestinations.find(dest => dest.id === id);
    if (destination) {
        // Create modal or detailed view
        alert(`${destination.title}\n\n${destination.description}\n\nคะแนน: ${destination.rating}/5\nที่อยู่: ${destination.location}`);
    }
}

async function loadWeatherInfo() {
    const weatherInfo = document.getElementById('weather-info');
    if (!weatherInfo) return;

    try {
        // Simulate weather API call
        const weatherData = {
            temp: Math.round(25 + Math.random() * 10),
            humidity: Math.round(60 + Math.random() * 20),
            description: ['อากาศดี', 'มีเมฆบางส่วน', 'อากาศแจ่มใส'][Math.floor(Math.random() * 3)]
        };

        weatherInfo.innerHTML = `
            <div class="weather-display">
                <div class="weather-temp">${weatherData.temp}°C</div>
                <div class="weather-desc">${weatherData.description}</div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <i class="fas fa-tint"></i>
                        <span>ความชื้น ${weatherData.humidity}%</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        weatherInfo.innerHTML = `
            <div class="weather-display">
                <div class="weather-temp">28°C</div>
                <div class="weather-desc">อากาศดี</div>
            </div>
        `;
    }
}

function setupPageTransitions() {
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements when they're added to DOM
    const observeElements = () => {
        document.querySelectorAll('.destination-card:not(.observed)').forEach(el => {
            el.classList.add('observed');
            observer.observe(el);
        });
    };

    // Initial observation
    observeElements();
    
    // Re-observe when new content is added
    const targetNode = document.getElementById('destination-grid');
    if (targetNode) {
        const mutationObserver = new MutationObserver(observeElements);
        mutationObserver.observe(targetNode, { childList: true });
    }
}

function showErrorMessage() {
    const grid = document.getElementById('destination-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>เกิดข้อผิดพลาด</h3>
                <p>ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>
                <button class="btn btn-primary" onclick="location.reload()">รีเฟรชหน้า</button>
            </div>
        `;
    }
}