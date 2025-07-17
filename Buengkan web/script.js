document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    // Toggle mobile menu
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });

        // Close menu when a link is clicked (for smoother navigation on mobile)
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navList.classList.contains('active')) {
                    navList.classList.remove('active');
                }
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Background Slideshow Functionality
    const backgroundSlides = document.querySelectorAll('.hero-background-slideshow');
    // อาร์เรย์ของชื่อไฟล์รูปภาพ
    const imageFiles = ['1.png', '2.png', '3.png', '4.png'];
    let currentSlide = 0;

    // ตั้งค่า background-image ให้กับแต่ละ slide element ใน JavaScript
    backgroundSlides.forEach((slide, index) => {
        if (imageFiles[index]) {
            slide.style.backgroundImage = `url('${imageFiles[index]}')`;
        }
    });

    function showSlide(index) {
        backgroundSlides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % backgroundSlides.length;
        showSlide(currentSlide);
    }

    // Initial display
    if (backgroundSlides.length > 0) {
        showSlide(currentSlide);
        // Change slide every 5 seconds (adjust as needed)
        setInterval(nextSlide, 5000); 
    }
});