// Makamithi Website - Main JavaScript
// Mobile Navigation Toggle
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const mobileClose = document.querySelector('.mobile-close');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

function openMobileMenu() {
    burger.classList.add('active');
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    burger.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (burger && mobileMenu) {
    burger.addEventListener('click', openMobileMenu);

    if (mobileClose) {
        mobileClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

// Hero Search Form
const heroSearchForm = document.getElementById('hero-search-form');
if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('hero-search-input');
        const query = searchInput.value.trim();

        if (query) {
            // Redirect to products page with search query
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    });
}

// Active Navigation State
const sections = document.querySelectorAll('section');
const sidebarLinks = document.querySelectorAll('.navbar .nav-link');
const topNavLinks = document.querySelectorAll('.top-nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    // Update sidebar links
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });

    // Update top nav links
    topNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });

    // Update mobile menu links
    mobileLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.about-card, .product-card, .service-card, .contact-item').forEach(el => {
    observer.observe(el);
});

// Form Validation and Submission
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const submitBtn = contactForm.querySelector('.submit-btn');

// Validation patterns
const patterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+?254|0)[17]\d{8}$/,
    message: /^.{10,500}$/
};

// Real-time validation
function validateField(field) {
    const fieldGroup = field.closest('.form-group');
    const icon = fieldGroup.querySelector('.validation-icon');
    const errorMsg = fieldGroup.querySelector('.error-message');
    const fieldName = field.name;
    let isValid = false;

    if (field.tagName === 'SELECT') {
        isValid = field.value !== '';
    } else if (patterns[fieldName]) {
        isValid = patterns[fieldName].test(field.value);
    } else {
        isValid = field.value.trim() !== '';
    }

    // Update UI
    if (isValid) {
        field.classList.remove('invalid');
        field.classList.add('valid');
        icon.classList.remove('invalid');
        icon.classList.add('valid');
        if (errorMsg) errorMsg.classList.remove('show');
    } else if (field.value !== '') {
        field.classList.remove('valid');
        field.classList.add('invalid');
        icon.classList.remove('valid');
        icon.classList.add('invalid');
        if (errorMsg) errorMsg.classList.add('show');
    } else {
        field.classList.remove('valid', 'invalid');
        icon.classList.remove('valid', 'invalid');
        if (errorMsg) errorMsg.classList.remove('show');
    }

    return isValid;
}

// Add validation listeners
['name', 'email', 'phone', 'location', 'message'].forEach(fieldName => {
    const field = contactForm.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                validateField(field);
            }
        });
    }
});

// Form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous messages
    successMessage.classList.remove('show');
    errorMessage.classList.remove('show');

    // Validate all required fields
    const requiredFields = contactForm.querySelectorAll('[required]');
    let isFormValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        errorText.textContent = 'Please fill in all required fields correctly.';
        errorMessage.classList.add('show');
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Replace with actual form submission
        // Example using FormSpree:
        // const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        //     method: 'POST',
        //     body: formData,
        //     headers: { 'Accept': 'application/json' }
        // });

        console.log('Form submitted:', data);

        // Show success message
        successMessage.classList.add('show');
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Reset form
        contactForm.reset();
        contactForm.querySelectorAll('.valid, .invalid').forEach(el => {
            el.classList.remove('valid', 'invalid');
        });
        contactForm.querySelectorAll('.validation-icon').forEach(icon => {
            icon.classList.remove('valid', 'invalid');
        });

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);

    } catch (error) {
        console.error('Form submission error:', error);
        errorText.textContent = 'Failed to send message. Please try WhatsApp instead.';
        errorMessage.classList.add('show');
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 70;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});
