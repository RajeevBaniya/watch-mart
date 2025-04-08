// Standalone Popup Component
class CartPopup {
    constructor() {
        this.popupOverlay = null;
        this.timeout = null;
        this.init();
    }

    init() {
        // Load CSS if not already loaded
        if (!document.querySelector('link[href="popup.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'popup.css';
            document.head.appendChild(link);
        }
        
        // Initialize cart counter if possible
        this.initCartCounter();
    }
    
    // Initialize cart counter
    initCartCounter() {
        // Find the shopping cart icon
        const cartIcon = document.querySelector('a.fas.fa-shopping-cart');
        if (!cartIcon) return;
        
        // Set positioning for proper counter display
        cartIcon.style.position = 'relative';
        cartIcon.style.display = 'inline-block';
        
        // Create counter if it doesn't exist
        if (!document.querySelector('.cart-counter')) {
            const counter = document.createElement('span');
            counter.classList.add('cart-counter');
            cartIcon.appendChild(counter);
            
            // Update counter if cart data is available
            if (window.getCart) {
                this.updateCounter(window.getCart());
            }
        }
    }
    
    // Update counter with cart data
    updateCounter(cart) {
        const counter = document.querySelector('.cart-counter');
        if (!counter) return;
        
        // Count unique items
        const itemCount = cart.length;
        
        if (itemCount > 0) {
            counter.textContent = itemCount;
            counter.style.display = 'flex';
        } else {
            counter.style.display = 'none';
        }
    }

    show(product) {
        // Clear any existing popup
        this.close();
        
        // Create popup HTML
        this.popupOverlay = document.createElement('div');
        this.popupOverlay.className = 'popup-overlay';
        
        const popupHTML = `
            <div class="popup-container">
                <div class="popup-header">
                    <h3>Item Added To Your Cart!</h3>
                </div>
                <div class="popup-content">
                    <div class="icon">✓</div>
                    <p>Your item has been added successfully</p>
                    <div class="popup-product">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="popup-product-info">
                            <h4>${product.name}</h4>
                            <div class="price">Rs ${product.price.toFixed(2)}</div>
                        </div>
                    </div>
                    <div class="popup-buttons">
                        <button class="continue">Continue Shopping</button>
                        <button class="view-cart">View Cart</button>
                    </div>
                </div>
            </div>
        `;
        
        this.popupOverlay.innerHTML = popupHTML;
        document.body.appendChild(this.popupOverlay);
        
        // Add event listeners
        this.popupOverlay.querySelector('.continue').addEventListener('click', () => {
            this.close();
        });
        
        this.popupOverlay.querySelector('.view-cart').addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
        
        // Auto close after 5 seconds
        this.timeout = setTimeout(() => {
            this.close();
        }, 5000);
        
        // Prevent closing when clicking on popup container
        this.popupOverlay.querySelector('.popup-container').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Close when clicking outside
        this.popupOverlay.addEventListener('click', () => {
            this.close();
        });
        
        // Ensure cart counter is updated
        this.initCartCounter();
        if (window.getCart) {
            this.updateCounter(window.getCart());
        }
    }
    
    close() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        
        if (this.popupOverlay) {
            this.popupOverlay.remove();
            this.popupOverlay = null;
        }
    }
}

// Create global instance
const cartPopup = new CartPopup();

// Export for use in other scripts
window.cartPopup = cartPopup; 