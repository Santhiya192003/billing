// Admin Panel Logic
const AdminManager = {
    currentEditId: null,

    // Initialize
    init() {
        this.renderMenuTable();
        this.setupEventListeners();
        this.initializeDatePicker();
    },

    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Menu form submission
        document.getElementById('menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMenuItem();
        });

        // Cancel edit button
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Generate report button
        document.getElementById('generate-report-btn').addEventListener('click', () => {
            this.generateReport();
        });

        // Export report button
        document.getElementById('export-report-btn').addEventListener('click', () => {
            this.exportReport();
        });
    },

    // Switch tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load data if switching to sales report
        if (tabName === 'sales-report') {
            this.generateReport();
        }
    },

    // Render menu table
    renderMenuTable() {
        const tbody = document.getElementById('menu-table-body');
        const menu = MenuManager.getMenu();

        tbody.innerHTML = '';

        menu.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${item.image ? 
                        `<img src="${item.image}" class="table-image" onerror="this.parentElement.textContent='${MenuManager.getFoodEmoji(item.name)}'">` : 
                        `<div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 2em; background: #f8f9fa; border-radius: 8px;">${MenuManager.getFoodEmoji(item.name)}</div>`
                    }
                </td>
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td>${item.description || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="AdminManager.editMenuItem(${item.id})">Edit</button>
                        <button class="delete-btn" onclick="AdminManager.deleteMenuItem(${item.id})">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // Save menu item (add or update)
    saveMenuItem() {
        const id = this.currentEditId;
        const name = document.getElementById('item-name').value.trim();
        const price = parseInt(document.getElementById('item-price').value);
        const image = document.getElementById('item-image').value.trim();
        const description = document.getElementById('item-description').value.trim();

        if (!name || !price) {
            alert('Please fill in all required fields');
            return;
        }

        const item = {
            name,
            price,
            image: image || '',
            description: description || ''
        };

        if (id) {
            // Update existing item
            MenuManager.updateItem(id, item);
            this.showNotification('Menu item updated successfully!');
        } else {
            // Add new item
            MenuManager.addItem(item);
            this.showNotification('Menu item added successfully!');
        }

        this.renderMenuTable();
        this.resetForm();
    },

    // Edit menu item
    editMenuItem(id) {
        const item = MenuManager.getItemById(id);
        if (!item) return;

        this.currentEditId = id;

        document.getElementById('item-id').value = id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-image').value = item.image || '';
        document.getElementById('item-description').value = item.description || '';

        document.getElementById('form-title').textContent = 'Edit Menu Item';
        document.getElementById('cancel-edit-btn').style.display = 'inline-block';

        // Scroll to form
        document.querySelector('.menu-form').scrollIntoView({ behavior: 'smooth' });
    },

    // Delete menu item
    deleteMenuItem(id) {
        const item = MenuManager.getItemById(id);
        if (!item) return;

        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
            MenuManager.deleteItem(id);
            this.renderMenuTable();
            this.showNotification('Menu item deleted successfully!');
        }
    },

    // Cancel edit
    cancelEdit() {
        this.resetForm();
    },

    // Reset form
    resetForm() {
        this.currentEditId = null;
        document.getElementById('menu-item-form').reset();
        document.getElementById('item-id').value = '';
        document.getElementById('form-title').textContent = 'Add New Item';
        document.getElementById('cancel-edit-btn').style.display = 'none';
    },

    // Initialize date picker with current month
    initializeDatePicker() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        document.getElementById('report-month').value = `${year}-${month}`;
    },

    // Generate sales report
    generateReport() {
        const monthInput = document.getElementById('report-month').value;
        if (!monthInput) {
            alert('Please select a month');
            return;
        }

        const [year, month] = monthInput.split('-').map(Number);
        const sales = SalesManager.getSalesByMonth(year, month - 1);

        // Calculate statistics
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalOrders = sales.length;
        const avgOrder = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

        // Update summary cards
        document.getElementById('total-sales').textContent = `₹${totalSales}`;
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('avg-order').textContent = `₹${avgOrder}`;

        // Render sales table
        this.renderSalesTable(sales);
    },

    // Render sales table
    renderSalesTable(sales) {
        const tbody = document.getElementById('sales-table-body');

        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px;">No sales data for this month</td></tr>';
            return;
        }

        tbody.innerHTML = '';

        // Sort by date (newest first)
        sales.sort((a, b) => new Date(b.date) - new Date(a.date));

        sales.forEach(sale => {
            const date = new Date(sale.date);
            const formattedDate = date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const itemsList = sale.items.map(item => 
                `${item.name} (x${item.quantity})`
            ).join(', ');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${itemsList}</td>
                <td>₹${sale.total}</td>
            `;
            tbody.appendChild(row);
        });
    },

    // Export report to CSV
    exportReport() {
        const monthInput = document.getElementById('report-month').value;
        if (!monthInput) {
            alert('Please select a month first');
            return;
        }

        const [year, month] = monthInput.split('-').map(Number);
        const sales = SalesManager.getSalesByMonth(year, month - 1);

        if (sales.length === 0) {
            alert('No sales data to export for this month');
            return;
        }

        // Create CSV content
        let csv = 'Date,Time,Items,Quantity,Total\n';

        sales.forEach(sale => {
            const date = new Date(sale.date);
            const dateStr = date.toLocaleDateString('en-IN');
            const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            
            sale.items.forEach(item => {
                csv += `"${dateStr}","${timeStr}","${item.name}",${item.quantity},₹${item.price * item.quantity}\n`;
            });
            
            csv += `"${dateStr}","${timeStr}","TOTAL",,₹${sale.total}\n`;
            csv += '\n';
        });

        // Add summary
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        csv += '\nSummary\n';
        csv += `Total Orders,${sales.length}\n`;
        csv += `Total Sales,₹${totalSales}\n`;
        csv += `Average Order,₹${Math.round(totalSales / sales.length)}\n`;

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${monthInput}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Report exported successfully!');
    },

    // Show notification
    showNotification(message) {
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
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    AdminManager.init();
});
