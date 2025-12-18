// Cart Management and Customer Page Logic
const CartManager = {
    cart: [],

    // Initialize
    init() {
        this.loadCart();
        this.renderMenu();
        this.renderCart();
        this.setupEventListeners();
    },

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('restaurantCart');
        this.cart = savedCart ? JSON.parse(savedCart) : [];
    },

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('restaurantCart', JSON.stringify(this.cart));
    },

    // Render menu items
    renderMenu() {
        const menuGrid = document.getElementById('menu-grid');
        const menu = MenuManager.getMenu();
        
        menuGrid.innerHTML = '';
        
        menu.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='${MenuManager.getFoodEmoji(item.name)}'">` : MenuManager.getFoodEmoji(item.name)}
                </div>
                <div class="menu-item-info">
                    <div class="menu-item-name">${item.name}</div>
                    ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
                    <div class="menu-item-price">₹${item.price}</div>
                    <button class="add-to-cart-btn" onclick="CartManager.addToCart(${item.id})">
                        Add to Cart
                    </button>
                </div>
            `;
            menuGrid.appendChild(menuItem);
        });
    },

    // Add item to cart
    addToCart(itemId) {
        const item = MenuManager.getItemById(itemId);
        if (!item) return;

        const cartItem = this.cart.find(ci => ci.id === itemId);
        
        if (cartItem) {
            cartItem.quantity++;
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }

        this.saveCart();
        this.renderCart();
        this.showNotification(`${item.name} added to cart!`);
    },

    // Update item quantity
    updateQuantity(itemId, change) {
        const cartItem = this.cart.find(ci => ci.id === itemId);
        if (!cartItem) return;

        cartItem.quantity += change;

        if (cartItem.quantity <= 0) {
            this.removeFromCart(itemId);
        } else {
            this.saveCart();
            this.renderCart();
        }
    },

    // Remove item from cart
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.renderCart();
    },

    // Clear cart
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Are you sure you want to clear the cart?')) {
            this.cart = [];
            this.saveCart();
            this.renderCart();
            this.showNotification('Cart cleared!');
        }
    },

    // Calculate total
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Render cart
    renderCart() {
        const cartItemsDiv = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (this.cart.length === 0) {
            cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotal.textContent = '₹0';
            return;
        }

        cartItemsDiv.innerHTML = '';
        
        this.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} each</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="CartManager.updateQuantity(${item.id}, -1)">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="CartManager.updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="CartManager.removeFromCart(${item.id})">Remove</button>
                </div>
            `;
            cartItemsDiv.appendChild(cartItem);
        });

        cartTotal.textContent = `₹${this.getTotal()}`;
    },

    // Show payment modal
    showPaymentModal() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const modal = document.getElementById('payment-modal');
        const billItems = document.getElementById('bill-items');
        const billTotal = document.getElementById('bill-total');

        // Render bill items
        billItems.innerHTML = '';
        this.cart.forEach(item => {
            const billItem = document.createElement('div');
            billItem.className = 'bill-item';
            billItem.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>₹${item.price * item.quantity}</span>
            `;
            billItems.appendChild(billItem);
        });

        billTotal.textContent = `₹${this.getTotal()}`;

        // Generate QR code
        this.generateQRCode();

        modal.style.display = 'block';
    },

    // Generate QR code (mock)
    generateQRCode() {
        const qrContainer = document.getElementById('qr-code');
        const total = this.getTotal();
        
        // Create a simple QR code using an API
        const qrData = `upi://pay?pa=restaurant@upi&pn=Restaurant&am=${total}&cu=INR`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        
        qrContainer.innerHTML = `<img src="${qrCodeUrl}" alt="Payment QR Code">`;
    },

    // Print bill
    printBill() {
        const printBill = document.getElementById('print-bill');
        const printDate = printBill.querySelector('.print-date');
        const printItems = printBill.querySelector('.print-items');
        const printTotal = printBill.querySelector('.print-total');

        // Set date
        printDate.textContent = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // Render items
        printItems.innerHTML = '<table style="width: 100%; margin-bottom: 20px;"><tr><th style="text-align: left;">Item</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th><th style="text-align: right;">Amount</th></tr>';
        
        this.cart.forEach(item => {
            printItems.innerHTML += `
                <tr>
                    <td>${item.name}</td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <td style="text-align: center;">${item.quantity}</td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <td style="text-align: right;">₹${item.price}</td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <td style="text-align: right;">₹${item.price * item.quantity}</td><br>
                </tr>
            `;
        });
        
        printItems.innerHTML += '</table>';

        // Set total
        printTotal.textContent = `Total Amount: ₹${this.getTotal()}`;

        // Print
        window.print();
    },

    // Confirm payment and save order
    confirmPayment() {
        if (this.cart.length === 0) return;

        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: [...this.cart],
            total: this.getTotal()
        };

        // Save to sales history
        SalesManager.addSale(order);

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.renderCart();

        // Close modal
        document.getElementById('payment-modal').style.display = 'none';

        // Show success message
        alert('Payment confirmed! Thank you for your order.');
        this.showNotification('Order placed successfully!');
    },

    // Show notification
    showNotification(message) {
        // Simple notification - could be enhanced with better UI
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },

    // Setup event listeners
    setupEventListeners() {
        // Clear cart button
        document.getElementById('clear-cart-btn').addEventListener('click', () => {
            this.clearCart();
        });

        // Pay now button
        document.getElementById('pay-now-btn').addEventListener('click', () => {
            this.showPaymentModal();
        });

        // Close modal
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('payment-modal').style.display = 'none';
        });

        // Print bill button
        document.getElementById('print-bill-btn').addEventListener('click', () => {
            this.printBill();
        });

        // Confirm payment button
        document.getElementById('confirm-payment-btn').addEventListener('click', () => {
            this.confirmPayment();
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('payment-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
};

// Sales Management
const SalesManager = {
    // Add sale to history
    addSale(order) {
        let sales = this.getSales();
        sales.push(order);
        localStorage.setItem('restaurantSales', JSON.stringify(sales));
    },

    // Get all sales
    getSales() {
        const sales = localStorage.getItem('restaurantSales');
        return sales ? JSON.parse(sales) : [];
    },

    // Get sales for specific month
    getSalesByMonth(year, month) {
        const sales = this.getSales();
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getFullYear() === year && saleDate.getMonth() === month;
        });
    }
};

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    CartManager.init();
});
