// nav-loader.js
// Create a promise-based script loader
function loadScript(src, attributes = {}) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        
        // Add any custom attributes
        Object.entries(attributes).forEach(([key, value]) => {
            script.setAttribute(key, value);
        });
        
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Script load error: ${src}`));
        document.head.appendChild(script);
    });
}

// Age verification handler
const ageVerificationHandler = {
    init() {
        // Only show if not verified in this session
        if (!sessionStorage.getItem('ageVerified')) {
            this.createModal();
        }

        // Make sure verifyAge is available globally
        window.verifyAge = (isOver21) => {
            if (isOver21) {
                sessionStorage.setItem('ageVerified', 'true');
                const modal = document.getElementById('ageModal');
                if (modal) {
                    modal.style.opacity = '0';
                    setTimeout(() => modal.remove(), 300); // Fade out animation
                }
            } else {
                window.location.href = 'https://www.google.com';
            }
        };
    },

    createModal() {
        const modalHTML = `
            <div id="ageModal" class="age-modal-overlay" style="opacity: 0; transition: opacity 0.3s ease;">
                <div class="age-modal">
                    <h2>Age Verification Required</h2>
                    <p>Please confirm that you are 21 years of age or older to continue.</p>
					<p>Remember it is wrong to lie so you must be honest not to get in trouble!</p>
                    <button class="age-button yes-button" onclick="verifyAge(true)">Yes, I am 21+</button>
                    <button class="age-button no-button" onclick="verifyAge(false)">No, I am under 21</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Fade in the modal
        setTimeout(() => {
            const modal = document.getElementById('ageModal');
            if (modal) modal.style.opacity = '1';
        }, 100);
    }
};

// Navigation handler
const navigationHandler = {
    async init() {
        const navContainer = document.createElement('div');
        navContainer.id = 'navigation-container';
        
        try {
            const response = await fetch('https://www.ai-ministries.com/components/nav.html');
            const html = await response.text();
            
            // Remove any script tags from the HTML before setting innerHTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const scripts = tempDiv.getElementsByTagName('script');
            Array.from(scripts).forEach(script => script.remove());
            
            // Set the cleaned HTML
            navContainer.innerHTML = tempDiv.innerHTML;
            
            // Insert navigation at the start of body
            document.body.insertBefore(navContainer, document.body.firstChild);
            
            // Initialize mobile menu functionality
            this.initMobileMenu();
        } catch (error) {
            console.error('Error loading navigation:', error);
        }
    },

    initMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-button');
        const menu = document.getElementById('mobile-menu');
        
        if (menuButton && menu) {
            // Toggle menu open/closed when button clicked
            menuButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent document click from immediately closing it
                menu.classList.toggle('show');
            });

            // Hide menu if clicking outside of it
            document.addEventListener('click', (event) => {
                if (!event.target.closest('.mobile-menu') && 
                    !event.target.closest('.mobile-menu-button') && 
                    menu.classList.contains('show')) {
                    menu.classList.remove('show');
                }
            });
        }
    }
};

// Cookie handler
const cookieHandler = {
    async init() {
        try {
            await loadScript('https://cdn.cookie-script.com/s/ec705f4147843dbfdb127ea600fc6d08.js', {
                'data-cs-no-consent-autoblock': '1'
            });
        } catch (error) {
            console.error('Error loading cookie script:', error);
        }
    }
};

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize all handlers in sequence
        ageVerificationHandler.init();
        await navigationHandler.init();
        await cookieHandler.init();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}, { once: true }); // Use once: true to ensure the listener only fires once