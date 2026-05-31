import React, { useState, useEffect } from 'react';
import api, { API_ORIGIN } from '../api/axios';
import { Search, Plus, Filter, Download, MoreVertical, Package, Flame, AlertTriangle, X, Edit, Trash2, ArrowUpRight, CheckCircle2, Thermometer, ShieldCheck, Camera, UploadCloud, FileText } from 'lucide-react';
import { jsPDF } from "jspdf";

const fruitOptions = [
    'Citrus', 'Apples', 'Mangoes', 'Grapes', 'Bananas', 'Guava', 'Pomegranate',
    'Watermelon', 'Papaya', 'Pear', 'Dates', 'Plum', 'Kiwi', 'Strawberry',
    'Pineapple', 'Lychee', 'Cherry', 'Apricot', 'Custard Apple', 'Persimmon'
];
import "jspdf-autotable";
import * as XLSX from 'xlsx';

const Inventory = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Categories');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(null);
    const [editData, setEditData] = useState({ stock: '', health: '' });
    const [showMenuId, setShowMenuId] = useState(null);

    const [products, setProducts] = useState([]);
    const [beyparis, setBeyparis] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/data/inventory');
            if (data && Array.isArray(data)) {
                setProducts(data.map(p => ({
                    ...p,
                    id: p._id,
                    name: p.name || 'Unknown Item',
                    sku: p.sku || 'N/A',
                    stock: parseInt(p.stock) || 0,
                    price: p.price || 0,
                    unit: p.unit || 'Crates',
                    category: p.category || 'Citrus',
                    health: p.health || '100%',
                    status: p.status || 'In Stock'
                })));
            }
        } catch (err) {
            console.error("Inventory fetch fail:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load from DB
    useEffect(() => {
        fetchInventory();
        fetchBeyparis();
    }, []);

    const fetchBeyparis = async () => {
        try {
            const { data } = await api.get('/data/beyparis');
            if (Array.isArray(data)) {
                setBeyparis(data.map(b => ({ id: b._id, name: b.name || 'Unknown', partnerId: b.partnerId || b._id })));
            }
        } catch (err) {
            console.error('Beyparis fetch fail:', err);
        }
    };

    const [newProduct, setNewProduct] = useState({ name: '', sku: '', stock: '', price: '', category: 'Citrus', unit: 'Crates', img: '', beypariId: '', beypariName: '' });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imgUrl = data.image;
            const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${API_ORIGIN}${imgUrl}`;
            setNewProduct(prev => ({ ...prev, img: fullUrl }));
        } catch (err) {
            console.error("Upload fail:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const getFruitImage = (name, category) => {
        const key = ((name || '') + ' ' + (category || '')).toLowerCase();
        const pick = (query) => `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(query)}`;
        if (key.includes('apple')) return pick('apple fruit');
        if (key.includes('banana')) return pick('banana fruit');
        if (key.includes('grape')) return pick('grapes fruit');
        if (key.includes('guava')) return pick('guava fruit');
        if (key.includes('pomegranate') || key.includes('anar')) return pick('pomegranate fruit');
        if (key.includes('citrus') || key.includes('orange') || key.includes('kinnow')) return pick('orange fruit');
        if (key.includes('mango')) return pick('mango fruit');
        if (key.includes('strawberry')) return pick('strawberry fruit');
        if (key.includes('pineapple')) return pick('pineapple fruit');
        if (key.includes('watermelon')) return pick('watermelon fruit');
        if (key.includes('melon')) return pick('melon fruit');
        return pick('fresh fruits');
    };

    const handleAddProduct = async (e, inShop = false) => {
        e.preventDefault();
        const stockValue = parseInt(newProduct.stock) || 0;
        const autoSku = newProduct.sku?.trim() || `INV-${String(products.length + 1).padStart(3, '0')}`;
        const p = {
            ...newProduct,
            sku: autoSku,
            img: newProduct.img || getFruitImage(newProduct.name, newProduct.category),
            health: "100%",
            stock: stockValue,
            isSoldInShop: inShop,
            status: stockValue === 0 ? "Out of Stock" : stockValue < 25 ? "Low Stock" : "In Stock",
            beypariName: newProduct.beypariName || '',
            beypariId: newProduct.beypariId || ''
        };
        
        try {
            await api.post('/data/inventory', p);
            await fetchInventory();
            setShowAddModal(false);
            setNewProduct({ name: '', sku: '', stock: '', price: '', category: 'Citrus', unit: 'Crates', img: '', beypariId: '', beypariName: '' });
        } catch (err) {
            console.error("Inventory save fail:", err);
            alert("Failed to save product to database.");
        }
    };

    const toggleShopStatus = async (id) => {
        const item = products.find(p => p.id === id);
        if (!item) return;
        const newStatus = !item.isSoldInShop;
        
        try {
            await api.put(`/data/inventory/${id}`, { isSoldInShop: newStatus });
            await fetchInventory();
        } catch (err) {
            console.error("Inventory update fail:", err);
            alert("Failed to update shop status.");
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!showEditModal) return;
        const s = parseInt(editData.stock) || 0;
        const updateData = {
            stock: s,
            health: (editData.health || '100') + "%",
            status: s === 0 ? "Out of Stock" : s < 25 ? "Low Stock" : "In Stock"
        };
        
        try {
            await api.put(`/data/inventory/${showEditModal.id}`, updateData);
            await fetchInventory();
            setShowEditModal(null);
            setShowMenuId(null);
        } catch (err) {
            console.error("Stock update fail:", err);
            alert("Failed to update stock in database.");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        e.preventDefault();
        if (window.confirm("Are you sure you want to remove this item from inventory?")) {
            try {
                await api.delete(`/data/inventory/${id}`);
                await fetchInventory();
                setShowMenuId(null);
            } catch (err) {
                console.error("Inventory delete fail:", err);
                alert("Failed to delete product from database.");
            }
        }
    };

    const handleExportExcel = () => {
        const data = filteredProducts.map(p => ({
            Product: p.name,
            SKU: p.sku,
            Category: p.category,
            Stock: p.stock,
            Unit: p.unit,
            Price: p.price,
            Status: p.status,
            Quality: p.health
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
        XLSX.writeFile(workbook, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Javed & Sons - Inventory Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
        
        const tableColumn = ["Product", "SKU", "Category", "Stock", "Unit", "Price", "Status"];
        const tableRows = filteredProducts.map(p => [
            p.name, p.sku, p.category, p.stock, p.unit, `RS ${p.price}`, p.status
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillStyle: 'var(--primary)', fillColor: [22, 163, 74] }
        });
        
        doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All Categories' || p.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const categories = ['All Categories', ...new Set(products.map(p => p.category))];

    // Dynamic Stats
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Inventory Status</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor real-time stock levels, quality health, and sales velocity.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="clay-button" style={{ border: '2px solid var(--primary)', color: 'var(--primary)' }} onClick={() => setShowAddModal('shop')}><Plus /> Add Stock in Shop</button>
                    <button className="clay-button primary" onClick={() => setShowAddModal('inventory')}><Plus /> Add Stock (Private)</button>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button className="clay-button" onClick={() => setShowMenuId(showMenuId === 'export' ? null : 'export')}>
                            <Download /> Export <MoreVertical size={14} />
                        </button>
                        {showMenuId === 'export' && (
                            <div className="clay-card" style={{ position: 'absolute', right: 0, top: '55px', zIndex: 1000, width: '150px', padding: '0.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <button className="menu-item" style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '12px' }} onClick={handleExportExcel}>Excel (.xlsx)</button>
                                <button className="menu-item" style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '12px' }} onClick={handleExportPDF}>PDF (.pdf)</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Modals */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', borderRadius: '40px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Add {showAddModal === 'shop' ? 'Shop Produce' : 'Private Inventory'}</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', border: 'none', color: 'var(--danger)', padding: 0 }} onClick={() => setShowAddModal(false)}><X /></button>
                        </div>
                        <form onSubmit={(e) => handleAddProduct(e, showAddModal === 'shop')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Name</label>
                                <input
                                    type="text"
                                    list="fruit-options"
                                    className="clay-input"
                                    required
                                    placeholder="Choose or search fruit"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                                <datalist id="fruit-options">
                                    {fruitOptions.map((fruit) => (
                                        <option key={fruit} value={fruit} />
                                    ))}
                                </datalist>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>SKU Code</label>
                                    <input type="text" className="clay-input" placeholder="Leave blank to auto-generate" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crate Price (₨)</label>
                                    <input type="number" className="clay-input" required placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Initial Stock</label>
                                    <input type="number" className="clay-input" required placeholder="Amount" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
                                    <select className="clay-input" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                                        {fruitOptions.map((fruit) => <option key={fruit}>{fruit}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Unit</label>
                                    <select className="clay-input" value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}>
                                        <option>Crates</option>
                                        <option>Bags</option>
                                        <option>Dozens</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Associated Beypari</label>
                                <select
                                    className="clay-input"
                                    value={newProduct.beypariId}
                                    onChange={(e) => {
                                        const selected = beyparis.find(b => b.id === e.target.value);
                                        setNewProduct({
                                            ...newProduct,
                                            beypariId: selected?.id || '',
                                            beypariName: selected?.name || ''
                                        });
                                    }}
                                >
                                    <option value="">None selected</option>
                                    {beyparis.map((bp) => (
                                        <option key={bp.id} value={bp.id}>{bp.name} ({bp.partnerId})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Image</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '15px', background: 'var(--warm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed #cbd5e1' }}>
                                        {newProduct.img ? (
                                            <img src={newProduct.img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Camera size={24} color="#64748b" />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input 
                                            type="file" 
                                            id="product-image-upload" 
                                            onChange={handleImageUpload} 
                                            style={{ display: 'none' }} 
                                            accept="image/*"
                                        />
                                        <label 
                                            htmlFor="product-image-upload" 
                                            className="clay-button" 
                                            style={{ width: '100%', cursor: 'pointer', fontSize: '0.9rem', gap: '0.5rem', background: uploading ? '#f1f5f9' : 'white' }}
                                        >
                                            <UploadCloud size={18} /> {uploading ? 'Uploading...' : 'Choose Photo'}
                                        </label>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG under 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={uploading} className="clay-button primary" style={{ height: '60px', marginTop: '1rem', fontSize: '1.1rem', opacity: uploading ? 0.7 : 1 }}>Register Stock</button>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '400px', width: '100%', padding: '3rem', borderRadius: '40px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Update Stock</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', border: 'none', color: 'var(--danger)', padding: 0 }} onClick={() => setShowEditModal(null)}><X /></button>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>EDITING PRODUCT:</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{showEditModal.name}</div>
                        </div>
                        <form onSubmit={handleUpdateStock} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Current Quantity ({showEditModal.unit})</label>
                                <div style={{ position: 'relative' }}>
                                    <Package style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px' }} />
                                    <input type="number" className="clay-input" value={editData.stock} onChange={(e) => setEditData({ ...editData, stock: e.target.value })} style={{ paddingLeft: '3rem' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Produce Health (Quality %)</label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px' }} />
                                    <input type="number" className="clay-input" value={editData.health} onChange={(e) => setEditData({ ...editData, health: e.target.value })} style={{ paddingLeft: '3rem' }} />
                                </div>
                            </div>
                            <button type="submit" className="clay-button primary" style={{ height: '55px', borderRadius: '18px', background: 'var(--success)' }}>Apply Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Analytics Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="clay-card" style={{ borderBottom: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: 'var(--mint-bg)', color: 'var(--primary-dark)' }}><Package /></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>TOTAL CAPACITY</span>
                    </div>
                    <h2 style={{ fontSize: '1.8rem' }}>{totalUnits.toLocaleString()} Units</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Active Cold Storage (Section A-4)</div>
                </div>
                <div className="clay-card" style={{ borderBottom: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#fff7ed', color: '#c2410c' }}><Flame /></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>FAST MOVING</span>
                    </div>
                    <h2 style={{ fontSize: '1.8rem' }}>None</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No sales velocity data</div>
                </div>
                <div className="clay-card" style={{ borderBottom: '4px solid var(--danger)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#fee2e2', color: '#991b1b' }}><AlertTriangle /></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>CRITICAL ALERTS</span>
                    </div>
                    <h2 style={{ fontSize: '1.8rem' }}>{lowStockCount} Items</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.5rem' }}>Action required for restock</div>
                </div>
            </div>

            {/* Edit Stock Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', borderRadius: '40px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Update: {showEditModal.name}</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', border: 'none', color: 'var(--danger)', padding: 0 }} onClick={() => setShowEditModal(null)}><X /></button>
                        </div>
                        <form onSubmit={handleUpdateStock} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Adjust Stock ({showEditModal.unit})</label>
                                <input type="number" className="clay-input" required value={editData.stock} onChange={(e) => setEditData({ ...editData, stock: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quality Health (%)</label>
                                <input type="number" className="clay-input" min="0" max="100" value={editData.health} onChange={(e) => setEditData({ ...editData, health: e.target.value })} />
                            </div>
                            <button className="clay-button primary" style={{ marginTop: '1rem' }}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="clay-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
                        <input
                            type="text"
                            className="clay-input"
                            placeholder="Search product name or SKU..."
                            style={{ paddingLeft: '3.2rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select className="clay-input" style={{ width: 'auto' }} value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Product & SKU</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Category</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Stock Level</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Quality Health</th>
                                <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--warm-bg)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            <p>Fetching real-time inventory from database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                        <Package style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.2 }} />
                                        <p>No products found matching your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', position: 'relative' }}>
                                        <td style={{ padding: '1.5rem 1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span>SKU: {p.sku}</span>
                                                {p.beypariName && <span style={{ background: '#f8fafc', color: '#334155', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>Beypari: {p.beypariName}</span>}
                                                {p.isSoldInShop && <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>IN SHOP</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 1rem' }}><span className="clay-chip">{p.category}</span></td>
                                        <td style={{ padding: '1.5rem 1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{p.stock} {p.unit}</div>
                                            <div style={{ fontSize: '0.75rem', color: p.status === 'Low Stock' || p.status === 'Out of Stock' ? 'var(--danger)' : 'var(--success)' }}>
                                                {p.status}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{ width: '80px', height: '8px', background: 'var(--warm-bg)', borderRadius: '10px', boxShadow: 'var(--clay-shadow-in)', overflow: 'hidden' }}>
                                                    <div style={{ width: p.health, height: '100%', background: parseInt(p.health) > 80 ? 'var(--success)' : parseInt(p.health) > 40 ? 'var(--accent)' : 'var(--danger)', transition: 'width 0.5s ease' }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.health}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                                            <div style={{ position: 'relative' }}>
                                                <button className="clay-button" style={{ width: '40px', height: '40px', padding: 0 }} onClick={() => setShowMenuId(showMenuId === p.id ? null : p.id)}><MoreVertical size={18} /></button>
                                                {showMenuId === p.id && (
                                                    <div className="clay-card" style={{ position: 'absolute', right: '50px', top: '0', zIndex: 1000, padding: '0.5rem', width: '160px', textAlign: 'left', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                        <button
                                                            className="menu-item"
                                                            style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', borderRadius: '12px' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleShopStatus(p.id);
                                                                setShowMenuId(null);
                                                            }}
                                                        >
                                                            <CheckCircle2 size={16} color={p.isSoldInShop ? "var(--danger)" : "var(--primary)"} /> {p.isSoldInShop ? "Remove from Shop" : "Push to Shop"}
                                                        </button>
                                                        <button
                                                            className="menu-item"
                                                            style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', borderRadius: '12px' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowEditModal(p);
                                                                setEditData({ stock: p.stock.toString(), health: p.health.replace('%', '') });
                                                            }}
                                                        >
                                                            <Edit size={16} /> Edit Info
                                                        </button>
                                                        <button
                                                            className="menu-item delete-btn"
                                                            style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', borderRadius: '12px', color: '#ef4444' }}
                                                            onClick={(e) => handleDelete(e, p.id)}
                                                        >
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
