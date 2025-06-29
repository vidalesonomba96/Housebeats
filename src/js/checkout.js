// Housebeats/src/js/checkout.js

function initializeCheckout() {
    console.log("Initializing checkout scripts...");

    const checkoutForm = document.getElementById('checkout-form');
    const licenseSelects = document.querySelectorAll('.license-select');
    const removeItemBtns = document.querySelectorAll('.remove-item-btn');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cardNumberInput = document.getElementById('card_number');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');

    // License selection change handler
    licenseSelects.forEach(select => {
        select.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = parseFloat(selectedOption.dataset.price);
            const priceElement = this.closest('.order-item').querySelector('.price');
            priceElement.textContent = `$${price.toFixed(2)}`;
            updateOrderTotal();
        });
    });

    // Remove item from cart
    removeItemBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const beatId = this.dataset.beatId;
            const orderItem = this.closest('.order-item');
            
            try {
                const response = await fetch('handle_cart.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'remove',
                        beat_id: beatId
                    })
                });

                const data = await response.json();
                
                if (data.status === 'success') {
                    orderItem.remove();
                    updateOrderTotal();
                    
                    // Update cart count in header
                    if (typeof updateCart === 'function') {
                        updateCart();
                    }
                    
                    // Check if cart is empty
                    const remainingItems = document.querySelectorAll('.order-item');
                    if (remainingItems.length === 0) {
                        location.reload(); // Reload to show empty cart message
                    }
                    
                    if (typeof createToast === 'function') {
                        createToast(data.message, 'success');
                    }
                } else {
                    if (typeof createToast === 'function') {
                        createToast(data.message, 'error');
                    }
                }
            } catch (error) {
                console.error('Error removing item:', error);
                if (typeof createToast === 'function') {
                    createToast('Error removing item from cart', 'error');
                }
            }
        });
    });

    // Payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            const methodType = this.dataset.method;
            document.querySelectorAll('.payment-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${methodType}-payment`).classList.add('active');
        });
    });

    // Card number formatting
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }

    // Expiry date formatting
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }

    // CVV validation
    if (cvvInput) {
        cvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // Form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.complete-order-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            try {
                // Collect order data
                const orderItems = [];
                document.querySelectorAll('.order-item').forEach(item => {
                    const beatId = item.dataset.beatId;
                    const licenseSelect = item.querySelector('.license-select');
                    const selectedOption = licenseSelect.options[licenseSelect.selectedIndex];
                    
                    orderItems.push({
                        beat_id: parseInt(beatId),
                        license_type: selectedOption.value,
                        price: parseFloat(selectedOption.dataset.price)
                    });
                });

                const orderData = {
                    items: orderItems,
                    subtotal: calculateSubtotal(),
                    tax: 0, // No tax for now
                    total: calculateSubtotal()
                };

                const billingInfo = {
                    email: document.getElementById('email').value,
                    first_name: document.getElementById('first_name').value,
                    last_name: document.getElementById('last_name').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zip: document.getElementById('zip').value
                };

                const paymentMethod = document.querySelector('.payment-method.active').dataset.method;

                const response = await fetch('handle_checkout.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'process_order',
                        order_data: orderData,
                        billing_info: billingInfo,
                        payment_method: paymentMethod
                    })
                });

                const data = await response.json();
                
                if (data.status === 'success') {
                    if (typeof createToast === 'function') {
                        createToast(data.message, 'success');
                    }
                    
                    // Redirect to success page or show success message
                    setTimeout(() => {
                        window.location.href = 'index.php';
                    }, 2000);
                } else {
                    if (typeof createToast === 'function') {
                        createToast(data.message, 'error');
                    }
                }
            } catch (error) {
                console.error('Checkout error:', error);
                if (typeof createToast === 'function') {
                    createToast('Checkout failed. Please try again.', 'error');
                }
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    function calculateSubtotal() {
        let subtotal = 0;
        document.querySelectorAll('.order-item .price').forEach(priceEl => {
            const price = parseFloat(priceEl.textContent.replace('$', ''));
            subtotal += price;
        });
        return subtotal;
    }

    function updateOrderTotal() {
        const subtotal = calculateSubtotal();
        const tax = 0; // No tax for now
        const total = subtotal + tax;

        document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('checkout-tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
    }

    // Initialize totals
    updateOrderTotal();
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCheckout);
} else {
    initializeCheckout();
}

// Make function globally available
window.initializeCheckout = initializeCheckout;