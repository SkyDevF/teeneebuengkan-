// Global state
let currentPage = 'hero';
let currentCategory = 'all';
let allDestinations = [];
let currentDestination = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupThemeToggle();
    setupNavigation();
    setupSlideshow();
    setupTabs();
    setupModal();
    loadAllDestinations();
    loadWeatherInfo();
    setupPageTransitions();
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);
    
    // Update icon based on current theme
    updateThemeIcon(currentTheme);
    
    // Add click event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply theme with smooth transition
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        body.setAttribute('data-theme', newTheme);
        
        // Save theme preference
        localStorage.setItem('theme', newTheme);
        
        // Update icon with animation
        themeIcon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            updateThemeIcon(newTheme);
            themeIcon.style.transform = 'rotate(0deg)';
        }, 150);
        
        // Remove transition after animation
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
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
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(tab => tab.classList.remove('active'));
            // Add active class to clicked tab
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            currentCategory = category;
            displayDestinations(category);
        });
    });
}

function setupModal() {
    const modal = document.getElementById('destination-modal');
    const closeBtn = document.querySelector('.close-btn');

    // Close modal when clicking close button
    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

async function loadAllDestinations() {
    try {
        showLoading();
        
        // ใช้ข้อมูลจาก BuengkanAPI โดยตรง (สำหรับ GitHub Pages)
        const attractions = await buengkanAPI.getAttractions();
        const cafes = await buengkanAPI.getCafes();
        const accommodations = await buengkanAPI.getAccommodations();
        const restaurants = await buengkanAPI.getRestaurants();
        
        // รวมข้อมูลทั้งหมด
        allDestinations = [
            ...attractions,
            ...cafes,
            ...accommodations,
            ...restaurants
        ];
        
        console.log('Loaded destinations from static data:', allDestinations.length, 'items');
        
        // Display initial content
        displayDestinations('all');
        
    } catch (error) {
        console.error('Error loading destinations:', error);
        showError();
    }
}

function displayDestinations(category) {
    const grid = document.getElementById('destination-grid');
    if (!grid) return;

    let filteredDestinations = allDestinations;
    
    if (category !== 'all') {
        filteredDestinations = allDestinations.filter(dest => dest.category === category);
    }

    if (filteredDestinations.length === 0) {
        grid.innerHTML = '<div class="no-results">ไม่พบข้อมูลในหมวดหมู่นี้</div>';
        return;
    }

    grid.innerHTML = filteredDestinations.map(dest => createDestinationCard(dest)).join('');
    
    // Add animation
    setTimeout(() => {
        grid.querySelectorAll('.destination-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('active');
            }, index * 100);
        });
    }, 100);
}

function createDestinationCard(destination) {
    const priceDisplay = destination.price ? `<span class="price">${destination.price}</span>` : '';
    
    // ใช้ฟังก์ชัน getImagePath เพื่อหาโฟลเดอร์และชื่อไฟล์ที่ถูกต้อง
    const imageUrl = getImagePath(destination);
    
    return `
        <div class="destination-card page-transition">
            <img src="${imageUrl}" alt="${destination.title}" loading="lazy" onerror="handleImageError(this, '${destination.title}')">
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
                <button class="btn btn-secondary" onclick="showDestinationDetail(${destination.id}, '${destination.category}')">
                    <i class="fas fa-eye"></i> ดูรายละเอียด
                </button>
            </div>
        </div>
    `;
}

// ฟังก์ชันสำหรับสร้างชื่อไฟล์รูปภาพและโฟลเดอร์
function getImagePath(destination) {
    // ใช้ path จากฐานข้อมูลโดยตรง หากมี
    if (destination.image) {
        // หาก path มีโฟลเดอร์อยู่แล้ว ให้ใช้เลย (ไม่ encode เพราะ server จะจัดการเอง)
        if (destination.image.includes('/')) {
            return destination.image;
        }
        
        // หาก path ไม่มีโฟลเดอร์ ให้เพิ่มโฟลเดอร์ตามหมวดหมู่
        const folderMap = {
            'attraction': 'สถานที่ท่องเที่ยว',
            'cafe': 'คาเฟ่',
            'accommodation': 'ที่พัก',
            'restaurant': 'ร้านอาหาร'
        };
        
        const folder = folderMap[destination.category] || 'สถานที่ท่องเที่ยว';
        return `${folder}/${destination.image}`;
    }
    
    // หากไม่มี path ในฐานข้อมูล ให้ใช้รูปภาพ fallback
    const fallbackImages = {
        'attraction': '1.png',
        'cafe': '2.png',
        'accommodation': '3.png',
        'restaurant': '4.png'
    };
    
    return fallbackImages[destination.category] || '1.png';
}

// ฟังก์ชันสำหรับสร้างชื่อไฟล์รูปภาพ
function getImageFileName(title) {
    // แปลงชื่อสถานที่เป็นชื่อไฟล์
    return title
        .replace(/\s+/g, '') // ลบช่องว่าง
        .replace(/[()]/g, '') // ลบวงเล็บ
        .replace(/[@&]/g, '') // ลบสัญลักษณ์พิเศษ
        .replace(/'/g, '') // ลบ apostrophe
        .replace(/-/g, '') // ลบขีดกลาง
        .replace(/\./g, '') // ลบจุด
        .trim();
}

function showDestinationDetail(id, category) {
    const destination = allDestinations.find(dest => dest.id === id && dest.category === category);
    if (!destination) return;

    currentDestination = destination;
    
    // ใช้ฟังก์ชัน getImagePath เพื่อหาโฟลเดอร์และชื่อไฟล์ที่ถูกต้องสำหรับ Modal
    const imageUrl = getImagePath(destination);
    
    // Populate modal content
    document.getElementById('modal-image').src = imageUrl;
    document.getElementById('modal-image').onerror = function() {
        handleImageError(this, destination.title);
    };
    document.getElementById('modal-name').textContent = destination.title;
    document.getElementById('modal-stars').textContent = '★'.repeat(Math.floor(destination.rating));
    document.getElementById('modal-rating-text').textContent = destination.rating;
    document.getElementById('modal-description').textContent = destination.description;
    
    // ใช้ข้อมูลจริงจากฐานข้อมูล
    document.getElementById('modal-location').textContent = destination.address || 'จังหวัดบึงกาฬ ประเทศไทย';
    document.getElementById('modal-hours').textContent = destination.opening_hours || '08:00 - 18:00 น. (ทุกวัน)';
    
    // Show/hide price section
    const priceSection = document.getElementById('modal-price-section');
    if (destination.price) {
        priceSection.style.display = 'block';
        document.getElementById('modal-price').textContent = destination.price;
    } else {
        priceSection.style.display = 'none';
    }
    
    // Load map
    loadGoogleMap(destination);
    
    // Show modal
    openModal();
}

function getLocationInfo(destination) {
    const locations = {
        attraction: {
            address: 'อำเภอเมือง จังหวัดบึงกาฬ 38000',
            hours: '06:00 - 18:00 น. (ทุกวัน)'
        },
        cafe: {
            address: 'ริมแม่น้ำโขง จังหวัดบึงกาฬ 38000',
            hours: '08:00 - 20:00 น. (ทุกวัน)'
        },
        accommodation: {
            address: 'ใจกลางเมือง จังหวัดบึงกาฬ 38000',
            hours: '24 ชั่วโมง'
        },
        restaurant: {
            address: 'ตลาดเก่า จังหวัดบึงกาฬ 38000',
            hours: '10:00 - 22:00 น. (ทุกวัน)'
        }
    };
    
    return locations[destination.category] || locations.attraction;
}

function loadGoogleMap(destination) {
    // ใช้พิกัดจริงของสถานที่
    const lat = destination.latitude || 18.3609;
    const lng = destination.longitude || 103.6469;
    
    // สร้าง URL สำหรับ Google Maps โดยไม่ต้องใช้ API Key
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=th&z=15&output=embed`;
    
    const mapFrame = document.getElementById('google-map');
    if (mapFrame) {
        mapFrame.src = mapUrl;
        mapFrame.title = `แผนที่ ${destination.title}`;
    }
}

function openModal() {
    const modal = document.getElementById('destination-modal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('destination-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function shareDestination() {
    if (!currentDestination) return;
    
    if (navigator.share) {
        navigator.share({
            title: currentDestination.title,
            text: currentDestination.description,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const text = `${currentDestination.title}\n${currentDestination.description}\n${window.location.href}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('คัดลอกข้อมูลแล้ว!');
        });
    }
}

function getDirections() {
    if (!currentDestination) return;
    
    // ใช้พิกัดจริงของสถานที่ปัจจุบัน
    const lat = currentDestination.latitude || 18.3609;
    const lng = currentDestination.longitude || 103.6469;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

function showCategoryPage(category, sectionId) {
    hideAllSections();
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        const grid = section.querySelector('.destination-grid');
        if (grid) {
            const categoryDestinations = allDestinations.filter(dest => dest.category === category);
            grid.innerHTML = categoryDestinations.map(dest => createDestinationCard(dest)).join('');
        }
        section.scrollIntoView({ behavior: 'smooth' });
    }
    
    currentPage = sectionId;
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
    currentPage = sectionId;
}

function hideAllSections() {
    const sections = ['attractions', 'cafes', 'accommodations', 'restaurants'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.add('hidden');
        }
    });
}

function showLoading() {
    const grid = document.getElementById('destination-grid');
    if (grid) {
        grid.innerHTML = '<div class="loading">กำลังโหลดข้อมูล...</div>';
    }
}

function showError() {
    const grid = document.getElementById('destination-grid');
    if (grid) {
        grid.innerHTML = '<div class="error">เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง</div>';
    }
}

async function loadWeatherInfo() {
    try {
        // Mock weather data for Bueng Kan
        const weatherData = {
            temp: Math.round(25 + Math.random() * 10),
            description: 'อากาศดี',
            humidity: Math.round(60 + Math.random() * 20),
            feels_like: Math.round(26 + Math.random() * 8)
        };
        
        const weatherInfo = document.getElementById('weather-info');
        if (weatherInfo) {
            weatherInfo.innerHTML = `
                <div class="weather-info">
                    <div class="weather-temp">${weatherData.temp}°C</div>
                    <div class="weather-desc">${weatherData.description}</div>
                    <div class="weather-details">
                        <div class="weather-detail">
                            <i class="fas fa-tint"></i>
                            <div>ความชื้น</div>
                            <div>${weatherData.humidity}%</div>
                        </div>
                        <div class="weather-detail">
                            <i class="fas fa-thermometer-half"></i>
                            <div>รู้สึกเหมือน</div>
                            <div>${weatherData.feels_like}°C</div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading weather:', error);
    }
}

function setupPageTransitions() {
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

    document.querySelectorAll('.page-transition').forEach(el => {
        observer.observe(el);
    });
}

// Load more functionality
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            // Simulate loading more content
            loadMoreBtn.textContent = 'กำลังโหลด...';
            setTimeout(() => {
                loadMoreBtn.textContent = 'โหลดเพิ่มเติม';
                alert('ข้อมูลทั้งหมดแสดงแล้ว!');
            }, 1000);
        });
    }

    // Setup contact form
    setupContactForm();
});

// Contact Form Handler
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    if (!name || !email || !message) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('กรุณากรอกอีเมลให้ถูกต้อง');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังส่ง...';
    submitBtn.disabled = true;
    
    try {
        // บันทึกข้อความใน localStorage (สำหรับ GitHub Pages)
        const messageData = {
            id: Date.now().toString(),
            name: name,
            email: email,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'new'
        };
        
        const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        existingMessages.unshift(messageData);
        localStorage.setItem('contactMessages', JSON.stringify(existingMessages));
        
        // แสดงข้อความสำเร็จ
        showSuccessMessage('ส่งข้อความเรียบร้อยแล้ว! ข้อความของคุณได้รับการบันทึกแล้ว');
        
        // รีเซ็ตฟอร์ม
        document.getElementById('contactForm').reset();
        
    } catch (error) {
        console.error('Error saving message:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showSuccessMessage(customMessage = null) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    
    const defaultMessage = 'ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับโดยเร็วที่สุด';
    const message = customMessage || defaultMessage;
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle notification-icon"></i>
            <div class="notification-text">
                <div class="notification-title">สำเร็จ!</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="notification-progress"></div>
    `;
    
    document.body.appendChild(notification);
    
    // Add animation keyframes if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .success-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(39, 174, 96, 0.3);
                z-index: 3000;
                font-family: 'Kanit', sans-serif;
                min-width: 320px;
                max-width: 400px;
                overflow: hidden;
                animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                padding: 16px 20px;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 1.5em;
                margin-top: 2px;
                animation: bounceIn 0.6s ease 0.2s both;
            }
            
            .notification-text {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 1.1em;
                margin-bottom: 4px;
            }
            
            .notification-message {
                font-size: 0.9em;
                opacity: 0.9;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
                opacity: 0.7;
            }
            
            .notification-close:hover {
                background-color: rgba(255, 255, 255, 0.1);
                opacity: 1;
            }
            
            .notification-progress {
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .notification-progress::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background: rgba(255, 255, 255, 0.8);
                animation: progressBar 5s linear;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                }
            }
            
            @keyframes bounceIn {
                0% {
                    transform: scale(0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes progressBar {
                from {
                    transform: translateX(-100%);
                }
                to {
                    transform: translateX(0);
                }
            }
            
            @media (max-width: 480px) {
                .success-notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

function closeNotification(button) {
    const notification = button.closest('.success-notification');
    removeNotification(notification);
}

function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Handle image loading errors
function handleImageError(img, title) {
    console.log('Image failed to load:', img.src);
    
    const originalSrc = img.src;
    const fallbackImages = ['1.png', '2.png', '3.png', '4.png'];
    
    // If it's already a fallback image, use placeholder
    if (fallbackImages.some(fallback => originalSrc.includes(fallback))) {
        img.src = `https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=${encodeURIComponent(title)}`;
        return;
    }
    
    // Try different encoding approaches for Thai filenames
    const attempts = [
        // Try without encoding
        originalSrc.replace(/%/g, ''),
        // Try with proper URI encoding
        originalSrc.split('/').map(part => encodeURIComponent(part)).join('/'),
        // Try with decoded URI
        decodeURIComponent(originalSrc),
        // Try with different path separators
        originalSrc.replace(/\//g, '\\'),
        // Try fallback images
        '1.png', '2.png', '3.png', '4.png'
    ];
    
    let attemptIndex = 0;
    
    function tryNextAttempt() {
        if (attemptIndex < attempts.length) {
            const testImg = new Image();
            testImg.onload = function() {
                img.src = attempts[attemptIndex];
            };
            testImg.onerror = function() {
                attemptIndex++;
                tryNextAttempt();
            };
            testImg.src = attempts[attemptIndex];
        } else {
            // All attempts failed, use placeholder
            img.src = `https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=${encodeURIComponent(title)}`;
        }
    }
    
    // Start trying alternatives
    attemptIndex++;
    tryNextAttempt();
}