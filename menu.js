// Menu Data Management
const MenuManager = {
    // Default menu items with prices specified by user
    defaultMenu: [
        { id: 1, name: 'Idly', price: 10, image: 'https://source.unsplash.com/200x200/?idli', description: '' },
        { id: 2, name: 'Poori', price: 30, image: 'https://source.unsplash.com/200x200/?poori', description: '1 set = 3 poori' },
        { id: 3, name: 'Vada', price: 10, image: 'https://source.unsplash.com/200x200/?vada', description: '' },
        { id: 4, name: 'Dosa', price: 45, image: 'https://source.unsplash.com/200x200/?dosa', description: '' },
        { id: 5, name: 'Balpan', price: 15, image: 'https://source.unsplash.com/200x200/?balpan,indian-food', description: '' },
        { id: 6, name: 'Tea', price: 15, image: 'https://source.unsplash.com/200x200/?tea', description: '' },
        { id: 7, name: 'Coffee', price: 15, image: 'https://source.unsplash.com/200x200/?coffee', description: '' },
        { id: 8, name: 'Puttu', price: 20, image: 'https://source.unsplash.com/200x200/?puttu', description: '' }
    ],

    // Initialize menu from localStorage or use default
    init() {
        const storedMenu = localStorage.getItem('restaurantMenu');
        if (!storedMenu) {
            this.saveMenu(this.defaultMenu);
        }
    },

    // Get all menu items
    getMenu() {
        const menu = localStorage.getItem('restaurantMenu');
        return menu ? JSON.parse(menu) : this.defaultMenu;
    },

    // Save menu to localStorage
    saveMenu(menu) {
        localStorage.setItem('restaurantMenu', JSON.stringify(menu));
    },

    // Get menu item by ID
    getItemById(id) {
        const menu = this.getMenu();
        return menu.find(item => item.id === id);
    },

    // Add new menu item
    addItem(item) {
        const menu = this.getMenu();
        const newId = menu.length > 0 ? Math.max(...menu.map(i => i.id)) + 1 : 1;
        item.id = newId;
        menu.push(item);
        this.saveMenu(menu);
        return item;
    },

    // Update menu item
    updateItem(id, updatedItem) {
        const menu = this.getMenu();
        const index = menu.findIndex(item => item.id === id);
        if (index !== -1) {
            menu[index] = { ...menu[index], ...updatedItem, id };
            this.saveMenu(menu);
            return true;
        }
        return false;
    },

    // Delete menu item
    deleteItem(id) {
        let menu = this.getMenu();
        menu = menu.filter(item => item.id !== id);
        this.saveMenu(menu);
        return true;
    },

    // Get food emoji based on item name
    getFoodEmoji(name) {
        const emojiMap = {
            'idly': '🍚',
            'poori': '🥞',
            'vada': '🍩',
            'dosa': '🥙',
            'balpan': '🍲',
            'tea': '☕',
            'coffee': '☕',
            'puttu': '🍚'
        };
        return emojiMap[name.toLowerCase()] || '🍽️';
    }
};

// Initialize menu on page load
MenuManager.init();
