// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartDisplay();
    
    // Add popup.js script if not already loaded
    if (!document.querySelector('script[src="popup.js"]')) {
        const script = document.createElement('script');
        script.src = 'popup.js';
        document.head.appendChild(script);
    }
    
    // Initialize cart counter immediately
    initCartCounter();
    updateCartIconCounter(getCart());
    
    // Add event listeners to handle quantity changes and removing items
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn')) {
            const itemId = e.target.closest('tr').dataset.id;
            const isIncrement = e.target.classList.contains('increment');
            updateQuantity(itemId, isIncrement);
        }
        
        if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            const itemId = e.target.closest('tr').dataset.id;
            removeFromCart(itemId);
            showDeleteConfirmation();
        }
    });
    
    // Handle quantity input changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const itemId = e.target.closest('tr').dataset.id;
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0) {
                setQuantity(itemId, newQuantity);
            } else {
                removeFromCart(itemId);
            }
        }
    });
    
    // Close popup overlay when clicking outside of popup
    document.addEventListener('click', function(e) {
        const overlay = document.querySelector('.cart-confirmation-overlay');
        if (overlay && e.target === overlay) {
            closeConfirmation();
        }
    });
    
    // Add checkout button click handler
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showCheckoutLoginPopup);
    }
});

// Add to cart function (to be called from product pages)
function addToCart(product) {
    let cart = getCart();
    
    // Check if product already exists in cart - only by exact ID match
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
        // Product exists, increase quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save updated cart
    saveCart(cart);
    
    // If on cart page, update display
    if (window.location.pathname.includes('cart.html')) {
        updateCartDisplay();
    }
}

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('watchCart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('watchCart', JSON.stringify(cart));
}

// Update quantity of an item
function updateQuantity(itemId, isIncrement) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        if (isIncrement) {
            cart[itemIndex].quantity += 1;
        } else {
            cart[itemIndex].quantity -= 1;
            
            // Remove item if quantity becomes 0
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
                showDeleteConfirmation();
            }
        }
        
        saveCart(cart);
        updateCartDisplay();
    }
}

// Set specific quantity for an item
function setQuantity(itemId, quantity) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = quantity;
        saveCart(cart);
        updateCartDisplay();
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    updateCartDisplay();
}

// Clear entire cart
function clearCart() {
    saveCart([]);
    updateCartDisplay();
}

// Load cart items from localStorage
function loadCart() {
    const cart = getCart();
    return cart;
}

// Update cart display on the cart page
function updateCartDisplay() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items-container');
    const emptyMessage = document.querySelector('.cart-empty-message');
    const cartContent = document.querySelector('.cart-content');
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    
    // Update cart icon counter if it exists
    updateCartIconCounter(cart);
    
    // Toggle visibility based on cart contents
    if (cart.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'flex';
        if (cartContent) cartContent.style.display = 'none';
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
        if (cartContent) cartContent.style.display = 'flex';
        
        if (!cartContainer) return; // If not on cart page, don't continue
        
        // Clear existing items
        cartContainer.innerHTML = '';
        
        // Add cart items to the container
        let subtotal = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemRow = document.createElement('tr');
            itemRow.dataset.id = item.id;
            
            itemRow.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${item.image}" alt="${item.name}" class="product-img"></td>
                <td class="product-name">${item.name}</td>
                <td>
                    <div class="quantity-controls">
                        <div class="quantity-btn decrement">-</div>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                        <div class="quantity-btn increment">+</div>
                    </div>
                </td>
                <td class="item-price">Rs ${item.price.toFixed(2)}</td>
                <td><button class="remove-btn"><i class="fas fa-trash"></i></button></td>
            `;
            
            cartContainer.appendChild(itemRow);
        });
        
        // Update totals
        if (subtotalElement) subtotalElement.textContent = `Rs ${subtotal.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `Rs ${subtotal.toFixed(2)}`;
        
        // Add checkout button click handler if it exists
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.removeEventListener('click', showCheckoutLoginPopup);
            checkoutBtn.addEventListener('click', showCheckoutLoginPopup);
        }
    }
}

// Initialize cart counter
function initCartCounter() {
    // Find the shopping cart icon
    const cartIcon = document.querySelector('a.fas.fa-shopping-cart');
    if (!cartIcon) return;
    
    // Set relative positioning on the cart icon if not already set
    cartIcon.style.position = 'relative';
    cartIcon.style.display = 'inline-block'; // Ensure it's an inline-block for proper positioning
    
    // Create counter if it doesn't exist
    if (!document.querySelector('.cart-counter')) {
        const counter = document.createElement('span');
        counter.classList.add('cart-counter');
        cartIcon.appendChild(counter);
    }
    
    // Make cart icon globally available
    window.initCartCounter = initCartCounter;
    window.updateCartIconCounter = updateCartIconCounter;
}

// Update cart icon counter
function updateCartIconCounter(cart) {
    // Initialize counter if it doesn't exist
    initCartCounter();
    
    // Find the counter element
    const counter = document.querySelector('.cart-counter');
    if (!counter) return;
    
    // Count number of unique items in cart (not total quantity)
    const itemCount = cart.length;
    
    if (itemCount > 0) {
        counter.textContent = itemCount;
        counter.style.display = 'flex';
        
        // Ensure proper styling
        const cartIcon = document.querySelector('a.fas.fa-shopping-cart');
        if (cartIcon) {
            // Position icon for proper counter placement
            if (window.getComputedStyle(cartIcon).position !== 'relative') {
                cartIcon.style.position = 'relative';
                cartIcon.style.display = 'inline-block';
            }
        }
    } else {
        counter.style.display = 'none';
    }
}

// Close the simple confirmation
function closeSimpleConfirmation() {
    const popupContainer = document.getElementById('cart-popup-container');
    if (popupContainer) {
        popupContainer.innerHTML = '';
    }
}

// Alternative confirmation method for when dynamic creation doesn't work
function showSimpleConfirmation(product) {
    // Get the cart popup container or create one if it doesn't exist
    let popupContainer = document.getElementById('cart-popup-container');
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        popupContainer.id = 'cart-popup-container';
        document.body.appendChild(popupContainer);
    }
    
    // Create popup HTML
    const popupHTML = `
        <div class="cart-confirmation-overlay active">
            <div class="cart-confirmation" style="opacity: 1; transform: translateY(0);">
                <div class="cart-confirmation-header">
                    <h3>Item Added To Your Cart!</h3>
                </div>
                <div class="cart-confirmation-content">
                    <i class="fas fa-check-circle icon"></i>
                    <p>The item has been added to your cart successfully</p>
                    <div class="cart-confirmation-product">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="cart-confirmation-product-info">
                            <h4>${product.name}</h4>
                            <div class="price">Rs ${product.price.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                <div class="cart-confirmation-buttons">
                    <button class="continue" onclick="closeSimpleConfirmation()">Continue Shopping</button>
                    <button class="view-cart" onclick="window.location.href='cart.html'">View Cart</button>
                </div>
            </div>
        </div>
    `;
    
    // Insert popup
    popupContainer.innerHTML = popupHTML;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        closeSimpleConfirmation();
    }, 5000);
    
    console.log('Simple cart confirmation displayed', product);
}

// Alternative confirmation method using the HTML template
function showTemplateConfirmation(product) {
    // First try to find the template
    const template = document.getElementById('cart-confirmation-template');
    
    if (!template) {
        // Fall back to simple confirmation if template doesn't exist
        return showSimpleConfirmation(product);
    }
    
    // Get the cart popup container or create one if it doesn't exist
    let popupContainer = document.getElementById('cart-popup-container');
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        popupContainer.id = 'cart-popup-container';
        document.body.appendChild(popupContainer);
    }
    
    // Clone the template content
    const clone = template.content.cloneNode(true);
    
    // Update product information
    const productImg = clone.querySelector('.product-image');
    const productName = clone.querySelector('.product-name');
    const productPrice = clone.querySelector('.price');
    
    if (productImg) productImg.src = product.image;
    if (productImg) productImg.alt = product.name;
    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = `Rs ${product.price.toFixed(2)}`;
    
    // Add event listeners
    const continueButton = clone.querySelector('.continue');
    const viewCartButton = clone.querySelector('.view-cart');
    
    if (continueButton) {
        continueButton.addEventListener('click', closeSimpleConfirmation);
    }
    
    if (viewCartButton) {
        viewCartButton.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
    
    // Clear previous content and append the clone
    popupContainer.innerHTML = '';
    popupContainer.appendChild(clone);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        closeSimpleConfirmation();
    }, 5000);
    
    console.log('Template cart confirmation displayed', product);
}

// Function to handle "Add to Cart" button clicks
function handleAddToCartClick(e) {
    e.preventDefault();
    
    // Get product information from the parent element
    const productBox = this.closest('.box') || this.closest('.content');
    if (!productBox) return;
    
    const productName = productBox.querySelector('h3')?.textContent || 'Featured Watch';
    const priceText = productBox.querySelector('.price')?.textContent || '';
    const priceMatch = priceText.match(/Rs\s+(\d+(\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 899.00;
    
    // Find the image
    let image = '';
    if (productBox.querySelector('.image img')) {
        image = productBox.querySelector('.image img').src;
    } else {
        // Try to find image in parent elements
        const parentWithImage = productBox.closest('.swiper-slide');
        if (parentWithImage && parentWithImage.querySelector('img')) {
            image = parentWithImage.querySelector('img').src;
        }
    }
    
    // Check if a similar product already exists in the cart
    const cart = getCart();
    const existingProduct = cart.find(item => 
        item.name === productName && 
        Math.abs(item.price - price) < 0.01 && // Comparing floats with a small tolerance
        item.image.includes(image.split('/').pop()) // Compare just the filename
    );
    
    let productId;
    if (existingProduct) {
        // Use existing product ID
        productId = existingProduct.id;
    } else {
        // Generate a truly unique ID with timestamp and random string
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10);
        productId = `product_${timestamp}_${randomStr}`;
    }
    
    // Create product object
    const product = {
        id: productId,
        name: productName,
        price: price,
        image: image,
        quantity: 1
    };
    
    // Add to cart
    addToCart(product);
    
    // Show popup using standalone component
    try {
        // Check if standalone popup component is available
        if (window.cartPopup) {
            window.cartPopup.show(product);
        } else {
            // Try fallback methods if standalone component isn't loaded yet
            tryFallbackConfirmationMethods(product);
        }
    } catch (error) {
        console.error("Error showing popup:", error);
        tryFallbackConfirmationMethods(product);
    }
}

// Try different confirmation methods as fallbacks
function tryFallbackConfirmationMethods(product) {
    try {
        // First try the template method
        showTemplateConfirmation(product);
    } catch (error1) {
        console.error("Error showing template confirmation:", error1);
        
        try {
            // Then try simple confirmation
            showSimpleConfirmation(product);
        } catch (error2) {
            console.error("Error showing simple confirmation:", error2);
            
            // Last resort - alert
            alert(`${product.name} added to cart!`);
        }
    }
}

// Handle "Add to Cart" buttons on product pages
document.addEventListener('DOMContentLoaded', function() {
    // Update cart counter
    updateCartIconCounter(getCart());
    
    const addToCartButtons = document.querySelectorAll('.btn');
    
    addToCartButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes('cart')) {
            button.removeEventListener('click', handleAddToCartClick); // Remove any existing listeners
            button.addEventListener('click', handleAddToCartClick);
        }
    });
});

// Generate a consistent product ID based on product details
function generateProductId(image, name, price) {
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();
    
    // Create a string from the product details including timestamp
    const productString = `${timestamp}|${image}|${name}|${price}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < productString.length; i++) {
        const char = productString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
}

// Show confirmation message with product details
function showConfirmation(product) {
    // Remove any existing overlay
    closeConfirmation();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('cart-confirmation-overlay');
    document.body.appendChild(overlay);
    
    // Create confirmation element
    const confirmation = document.createElement('div');
    confirmation.classList.add('cart-confirmation');
    
    confirmation.innerHTML = `
        <div class="cart-confirmation-header">
            <h3>Item Added To Your Cart!</h3>
        </div>
        <div class="cart-confirmation-content">
            <i class="fas fa-check-circle icon"></i>
            <p>The item has been added to your cart successfully</p>
            <div class="cart-confirmation-product">
                <img src="${product.image}" alt="${product.name}">
                <div class="cart-confirmation-product-info">
                    <h4>${product.name}</h4>
                    <div class="price">Rs ${product.price.toFixed(2)}</div>
                </div>
            </div>
        </div>
        <div class="cart-confirmation-buttons">
            <button class="continue">Continue Shopping</button>
            <button class="view-cart">View Cart</button>
        </div>
    `;
    
    // Add to overlay
    overlay.appendChild(confirmation);
    
    // Animate in (force browser to process the newly added elements first)
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    // Add event listeners
    confirmation.querySelector('.continue').addEventListener('click', function() {
        closeConfirmation();
    });
    
    confirmation.querySelector('.view-cart').addEventListener('click', function() {
        window.location.href = 'cart.html';
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        closeConfirmation();
    }, 5000);
    
    // Log to console for debugging
    console.log('Cart confirmation popup displayed', product);
}

// Close confirmation popup
function closeConfirmation() {
    const overlay = document.querySelector('.cart-confirmation-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300); // Wait for transition to complete
    }
}

// Show delete confirmation
function showDeleteConfirmation() {
    // Remove any existing overlay
    closeConfirmation();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('cart-confirmation-overlay');
    
    // Create confirmation element
    const confirmation = document.createElement('div');
    confirmation.classList.add('cart-confirmation');
    
    confirmation.innerHTML = `
        <div class="cart-confirmation-header">
            <h3>Item Removed From Cart</h3>
        </div>
        <div class="cart-confirmation-content">
            <i class="fas fa-trash icon delete"></i>
            <p>The item has been removed from your cart</p>
        </div>
        <div class="cart-confirmation-buttons">
            <button class="continue">Continue Shopping</button>
        </div>
    `;
    
    // Add to body
    overlay.appendChild(confirmation);
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    // Add event listeners
    confirmation.querySelector('.continue').addEventListener('click', function() {
        closeConfirmation();
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        closeConfirmation();
    }, 3000);
}

// Show checkout login popup
function showCheckoutLoginPopup(e) {
    if (e) e.preventDefault();
    
    // Remove any existing overlay
    closeConfirmation();
    
    // Try to use the template first
    const template = document.getElementById('checkout-login-template');
    
    if (template) {
        // Clone the template content
        const clone = template.content.cloneNode(true);
        
        // Create overlay and append the cloned content
        const overlay = document.createElement('div');
        overlay.classList.add('cart-confirmation-overlay');
        overlay.appendChild(clone);
        document.body.appendChild(overlay);
        
        // Add event listeners
        const continueButton = overlay.querySelector('.continue');
        const loginButton = overlay.querySelector('.login-redirect');
        
        if (continueButton) {
            continueButton.addEventListener('click', closeConfirmation);
        }
        
        if (loginButton) {
            loginButton.addEventListener('click', redirectToLogin);
        }
        
        // Animate in
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    } else {
        // Fallback if template is not available
        showSimpleLoginPopup();
    }
}

// Simple login popup when template is not available
function showSimpleLoginPopup() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('cart-confirmation-overlay');
    
    // Create confirmation element
    const confirmation = document.createElement('div');
    confirmation.classList.add('cart-confirmation');
    
    confirmation.innerHTML = `
        <div class="cart-confirmation-header">
            <h3>Login Required</h3>
        </div>
        <div class="cart-confirmation-content">
            <i class="fas fa-user-circle icon"></i>
            <p>Please Login Or Create An Account To Complete Your Purchase</p>
        </div>
        <div class="cart-confirmation-buttons">
            <button class="continue">Cancel</button>
            <button class="login-redirect">Login / Sign Up</button>
        </div>
    `;
    
    // Add to body
    overlay.appendChild(confirmation);
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    // Add event listeners
    confirmation.querySelector('.continue').addEventListener('click', closeConfirmation);
    confirmation.querySelector('.login-redirect').addEventListener('click', redirectToLogin);
}

// Redirect to login form
function redirectToLogin() {
    // Close the popup
    closeConfirmation();
    
    // Open the login form container
    const loginForm = document.querySelector('.login-form-container');
    if (loginForm) {
        loginForm.classList.add('active');
        
        // Activate the login tab if tabs exist
        const loginTab = document.querySelector('.form-tabs .tab[data-tab="login"]');
        const loginFormElement = document.getElementById('login-form');
        const signupFormElement = document.getElementById('signup-form');
        
        if (loginTab && loginFormElement && signupFormElement) {
            // Remove active class from all tabs and forms
            document.querySelectorAll('.form-tabs .tab').forEach(t => t.classList.remove('active'));
            loginFormElement.classList.remove('active');
            signupFormElement.classList.remove('active');
            
            // Add active class to login tab and form
            loginTab.classList.add('active');
            loginFormElement.classList.add('active');
        }
        
        // Scroll to login form
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        // If login form not found, redirect to homepage where login form is available
        window.location.href = 'index.html';
    }
} 