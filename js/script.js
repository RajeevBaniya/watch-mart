searchform = document.querySelector('.search-form');

document.querySelector('#search-btn').onclick = () =>{
    searchform.classList.toggle('active');
}

let loginForm = document.querySelector('.login-form-container');

document.querySelector('#login-btn').onclick = () =>{
    loginForm.classList.toggle('active');
}

document.querySelector('#close-login-btn').onclick = () =>{
    loginForm.classList.toggle('active');
}

// Form tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.form-tabs .tab');
    const forms = document.querySelectorAll('.form-content form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Deactivate all tabs and forms
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Activate clicked tab and corresponding form
            tab.classList.add('active');
            document.getElementById(`${target}-form`).classList.add('active');
        });
    });
    
    // Initialize cart counter if cart.js is loaded
    setTimeout(() => {
        if (window.initCartCounter) {
            window.initCartCounter();
            
            // Update cart counter if getCart function exists
            if (window.getCart) {
                window.updateCartIconCounter(window.getCart());
            }
        }
    }, 100); // Small delay to ensure scripts are loaded
});

window.onscroll = () =>{

    searchform.classList.remove('active');

    if(window.scrollY > 80){
        document.querySelector('.header .header-2').classList.add('active');
    }else{
        document.querySelector('.header .header-2').classList.remove('active');
    }

}

window.onload = () =>{

    if(window.scrollY > 80){
        document.querySelector('.header .header-2').classList.add('active');
    }else{
        document.querySelector('.header .header-2').classList.remove('active');
    }

}

var swiper = new Swiper(".watch-slider", {
    loop:true,
    centeredSlides: true,
    autoplay: {
     delay: 5500,
     disableOnInteraction: false,
    },
     breakpoints: {
       0: {
         slidesPerView: 1,
       },
       768: {
         slidesPerView: 2,
       },
       1024: {
         slidesPerView: 3,
       },
     },
   });

   var swiper = new Swiper(".featured-slider", {
    spaceBetween:10,
    loop:true,
    centeredSlides: true,
    autoplay: {
     delay: 9500,
     disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
     breakpoints: {
       0: {
         slidesPerView: 1,
       },
       450: {
        slidesPerView: 2,
      },
       768: {
         slidesPerView: 3,
       },
       1024: {
         slidesPerView: 4,
       },
     },
   });

   var swiper = new Swiper(".arrivals-slider", {
    spaceBetween:10,
    loop:true,
    centeredSlides: true,
    autoplay: {
     delay: 9500,
     disableOnInteraction: false,
    },
     breakpoints: {
       0: {
         slidesPerView: 1,
       },
       768: {
         slidesPerView: 2,
       },
       1024: {
         slidesPerView: 3,
       },
     },
   });

   var swiper = new Swiper(".reviews-slider", {
    spaceBetween:10,
    grabCursor:true,
    loop:true,
    centeredSlides: true,
    autoplay: {
     delay: 8500,
     disableOnInteraction: false,
    },
     breakpoints: {
       0: {
         slidesPerView: 1,
       },
       768: {
         slidesPerView: 2,
       },
       1024: {
         slidesPerView: 3,
       },
     },
   });

   var swiper = new Swiper(".blogs-slider", {
    spaceBetween:10,
    grabCursor:true,
    loop:true,
    centeredSlides: true,
    autoplay: {
     delay: 9500,
     disableOnInteraction: false,
    },
     breakpoints: {
       0: {
         slidesPerView: 1,
       },
       768: {
         slidesPerView: 2,
       },
       1024: {
         slidesPerView: 3,
       },
     },
   });

// Add to cart functionality for all product pages
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to all add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product details
            const productElement = this.closest('.box, .swiper-slide, .content');
            if (!productElement) return;
            
            // Extract product information
            const name = productElement.querySelector('h3')?.textContent || 'Featured Watch';
            const priceEl = productElement.querySelector('.price');
            const priceText = priceEl ? priceEl.textContent : 'Rs 899.00';
            const priceMatch = priceText.match(/Rs\s*(\d+(\.\d+)?)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 899.00;
            
            // Find image
            let imageEl = productElement.querySelector('img');
            const imageSrc = imageEl ? imageEl.src : 'image/watch-1.png';
            
            // Check if a similar product already exists in the cart
            if (window.getCart) {
                const cart = window.getCart();
                const existingProduct = cart.find(item => 
                    item.name === name && 
                    Math.abs(item.price - price) < 0.01 && // Comparing floats with tolerance
                    item.image.includes(imageSrc.split('/').pop()) // Compare filename
                );
                
                if (existingProduct) {
                    // If product exists, use its ID
                    const product = {
                        id: existingProduct.id,
                        name: name,
                        price: price,
                        image: imageSrc,
                        quantity: 1
                    };
                    
                    // Add to cart (will increase quantity)
                    if (window.addToCart) {
                        window.addToCart(product);
                        
                        // Show popup
                        if (window.cartPopup) {
                            window.cartPopup.show(product);
                        }
                    }
                    return;
                }
            }
            
            // Create unique product ID with timestamp
            const id = 'product_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
            
            // Create product object
            const product = {
                id: id,
                name: name,
                price: price,
                image: imageSrc,
                quantity: 1
            };
            
            // Add to cart
            if (window.addToCart) {
                window.addToCart(product);
                
                // Show popup using standalone component
                if (window.cartPopup) {
                    window.cartPopup.show(product);
                }
            } else {
                console.error('Cart functionality not available');
            }
        });
    });
});