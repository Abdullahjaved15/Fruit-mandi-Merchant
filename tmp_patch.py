import os

file_path = r"c:\Users\AL RAHMAN LAPTOP\OneDrive\Desktop\Fruit-Mandi\src\pages\Inventory.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace handleAddProduct
old_add = """    const handleAddProduct = (e, inShop = false) => {
        e.preventDefault();
        const stockValue = parseInt(newProduct.stock) || 0;
        const p = {
            ...newProduct,
            img: getFruitImage(newProduct.name, newProduct.category),
            health: "100%",
            stock: stockValue,
            isSoldInShop: inShop,
            status: stockValue === 0 ? "Out of Stock" : stockValue < 25 ? "Low Stock" : "In Stock"
        };
        // Update UI instantly
        setProducts([p, ...products]);
        setShowAddModal(false);
        setNewProduct({ name: '', sku: '', stock: '', price: '', category: 'Citrus', unit: 'Crates' });
        // Save to DB silently
        api.post('/data/inventory', p).catch((err) => console.error("Inventory save fail:", err));
    };"""

new_add = """    const handleAddProduct = async (e, inShop = false) => {
        e.preventDefault();
        const stockValue = parseInt(newProduct.stock) || 0;
        const p = {
            ...newProduct,
            img: getFruitImage(newProduct.name, newProduct.category),
            health: "100%",
            stock: stockValue,
            isSoldInShop: inShop,
            status: stockValue === 0 ? "Out of Stock" : stockValue < 25 ? "Low Stock" : "In Stock"
        };
        
        try {
            const { data } = await api.post('/data/inventory', p);
            // Update UI with the real data (including DB _id)
            setProducts([{ ...data, id: data._id }, ...products]);
            setShowAddModal(false);
            setNewProduct({ name: '', sku: '', stock: '', price: '', category: 'Citrus', unit: 'Crates' });
        } catch (err) {
            console.error("Inventory save fail:", err);
            alert("Failed to save product to database.");
        }
    };"""

# Replace toggleShopStatus
old_toggle = """    const toggleShopStatus = (id) => {
        const item = products.find(p => p.id === id);
        if (!item) return;
        const newStatus = !item.isSoldInShop;
        setProducts(products.map(p => p.id === id ? { ...p, isSoldInShop: newStatus } : p));
        // api request here if we had detailed update, for now silent local sync and mock it
    };"""

new_toggle = """    const toggleShopStatus = async (id) => {
        const item = products.find(p => p.id === id);
        if (!item) return;
        const newStatus = !item.isSoldInShop;
        
        try {
            // Apply optimistically
            setProducts(products.map(p => p.id === id ? { ...p, isSoldInShop: newStatus } : p));
            await api.put(`/data/inventory/${id}`, { isSoldInShop: newStatus });
        } catch (err) {
            console.error("Inventory update fail:", err);
            // Rollback on failure
            setProducts(products.map(p => p.id === id ? { ...p, isSoldInShop: !newStatus } : p));
            alert("Failed to update shop status.");
        }
    };"""

# Replace handleUpdateStock
old_update = """    const handleUpdateStock = (e) => {
        e.preventDefault();
        if (!showEditModal) return;
        const s = parseInt(editData.stock) || 0;
        const updateData = {
            stock: s,
            health: (editData.health || '100') + "%",
            status: s === 0 ? "Out of Stock" : s < 25 ? "Low Stock" : "In Stock"
        };
        setProducts(products.map(p => p.id === showEditModal.id ? { ...p, ...updateData } : p));
        setShowEditModal(null);
        setShowMenuId(null);
        // DB update logic would go here if we had an update endpoint, for now we let it be local
    };"""

new_update = """    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!showEditModal) return;
        const s = parseInt(editData.stock) || 0;
        const updateData = {
            stock: s,
            health: (editData.health || '100') + "%",
            status: s === 0 ? "Out of Stock" : s < 25 ? "Low Stock" : "In Stock"
        };
        
        try {
            // Local update
            setProducts(products.map(p => p.id === showEditModal.id ? { ...p, ...updateData } : p));
            await api.put(`/data/inventory/${showEditModal.id}`, updateData);
            setShowEditModal(null);
            setShowMenuId(null);
        } catch (err) {
            console.error("Stock update fail:", err);
            alert("Failed to update stock in database.");
        }
    };"""

# Attempt string replacement
import re

# Some files have \r\n
content = content.replace('\r\n', '\n')
old_add = old_add.replace('\r\n', '\n')
new_add = new_add.replace('\r\n', '\n')
old_toggle = old_toggle.replace('\r\n', '\n')
new_toggle = new_toggle.replace('\r\n', '\n')
old_update = old_update.replace('\r\n', '\n')
new_update = new_update.replace('\r\n', '\n')

content = content.replace(old_add, new_add)
content = content.replace(old_toggle, new_toggle)
content = content.replace(old_update, new_update)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
