import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Package, Search, CheckCircle2, MoreVertical, Plus, X, Edit,
    Trash2, Store, ShoppingBag, Star, ShieldCheck, Image, AlertTriangle,
    ChevronDown, ChevronUp, Eye, MapPin, CreditCard, Leaf, Info
} from 'lucide-react';

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
    return pick('fresh fruits'); // Default
};

/* ─── ADMIN STORE TAB ─────────────────────────────────────────────── */
const AdminStoreTab = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newProduct, setNewProduct] = useState({ name: '', sku: '', stock: '', price: '', category: 'Citrus', unit: 'Crates' });
    const [editData, setEditData] = useState({ name: '', stock: '', price: '', health: '' });


    const fetchInventory = async () => {
        try {
            const { data } = await api.get('/data/inventory');
            setProducts(data.map(p => ({
                ...p,
                id: p._id,
                stock: parseInt(p.stock) || 0,
                price: p.price || 0,
                health: p.health || '100%',
                status: p.status || 'In Stock'
            })));
        } catch (err) {
            console.error('Fetch inventory failed', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAdd = async (e, inShop = false) => {
        e.preventDefault();
        const stockValue = parseInt(newProduct.stock) || 0;
        const p = {
            ...newProduct,
            img: getFruitImage(newProduct.name, newProduct.category),
            health: '100%',
            stock: stockValue,
            isSoldInShop: inShop,
            status: stockValue === 0 ? 'Out of Stock' : stockValue < 25 ? 'Low Stock' : 'In Stock'
        };
        try {
            await api.post('/data/inventory', p);
            setShowAddModal(false);
            setNewProduct({ name: '', sku: '', stock: '', price: '', category: 'Citrus', unit: 'Crates' });
            await fetchInventory();
        } catch (err) {
            console.error('Add fail:', err);
            alert('Could not add product to store. Please try again.');
        }
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!showEditModal) return;
        const s = parseInt(editData.stock) || 0;
        const targetId = showEditModal.id;
        const update = {
            name: editData.name,
            stock: s,
            price: parseFloat(editData.price) || showEditModal.price,
            health: (editData.health || '100') + '%',
            status: s === 0 ? 'Out of Stock' : s < 25 ? 'Low Stock' : 'In Stock'
        };
        try {
            await api.put(`/data/inventory/${targetId}`, update);
            await fetchInventory();
            setShowEditModal(null);
        } catch (err) {
            console.error('Update fail:', err);
            alert('Could not save product changes. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this product?')) return;
        try {
            await api.delete(`/data/inventory/${id}`);
            await fetchInventory();
        } catch (err) {
            console.error('Delete fail:', err);
            alert('Could not delete product. Please try again.');
        }
    };

    const toggleShop = async (id) => {
        const item = products.find(p => p.id === id);
        if (!item) return;
        const nextState = !item.isSoldInShop;
        try {
            await api.put(`/data/inventory/${id}`, { isSoldInShop: nextState });
            await fetchInventory();
        } catch (err) {
            console.error('Toggle shop fail:', err);
            alert('Could not update shop visibility. Please try again.');
        }
    };

    const filtered = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const shopItems = filtered.filter(p => p.isSoldInShop);
    const privateItems = filtered.filter(p => !p.isSoldInShop);

    const ProductCard = ({ p }) => (
        <div className="clay-card" style={{
            background: 'white', borderRadius: '32px', padding: '1.5rem',
            position: 'relative', cursor: 'default',
            border: p.isSoldInShop ? '2px solid var(--primary)' : '2px solid transparent'
        }}>
            {/* Admin badge */}
            <div style={{
                position: 'absolute', top: '1rem', left: '1rem', zIndex: 5,
                padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                background: p.isSoldInShop ? '#dcfce7' : '#f3f4f6',
                color: p.isSoldInShop ? '#166534' : '#6b7280'
            }}>
                {p.isSoldInShop ? '🟢 IN SHOP' : '🔒 PRIVATE'}
            </div>

            {/* Image placeholder */}
            <div style={{
                height: '160px', borderRadius: '20px', marginBottom: '1.2rem',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3.5rem'
            }}>
                {p.category === 'Apples' ? '🍎' : p.category === 'Citrus' ? '🍊' : p.category === 'Mangoes' ? '🥭' : '🍇'}
            </div>

            <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.3rem' }}>{p.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>SKU: {p.sku} · {p.category}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary-dark)' }}>₨ {p.price}</div>
                <div style={{
                    padding: '0.3rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
                    background: p.stock < 20 ? '#fee2e2' : '#dcfce7',
                    color: p.stock < 20 ? '#991b1b' : '#166534'
                }}>
                    {p.stock} {p.unit}
                </div>
            </div>

            {/* Admin action buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                    className="clay-button"
                    style={{
                        flex: 1, padding: '0.6rem', fontSize: '0.8rem', fontWeight: 700,
                        background: p.isSoldInShop ? '#fee2e2' : 'var(--primary)', color: p.isSoldInShop ? '#991b1b' : 'white',
                        border: 'none'
                    }}
                    onClick={() => toggleShop(p.id)}
                >
                    {p.isSoldInShop ? '↩ Remove from Shop' : '🛒 Push to Shop'}
                </button>
                <button
                    className="clay-button"
                    style={{ padding: '0.6rem 0.8rem', background: '#f0f9ff', color: '#0369a1', border: 'none' }}
                    onClick={() => {
                        setShowEditModal(p);
                        setEditData({ name: p.name, stock: p.stock.toString(), price: p.price.toString(), health: (p.health || '100%').replace('%', '') });
                    }}
                >
                    <Edit size={16} />
                </button>
                <button
                    className="clay-button"
                    style={{ padding: '0.6rem 0.8rem', background: '#fff1f2', color: '#be123c', border: 'none' }}
                    onClick={() => handleDelete(p.id)}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div>
            {/* Header controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
                    <input
                        type="text" className="clay-input"
                        placeholder="Search products..."
                        style={{ paddingLeft: '3.2rem', width: '100%' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="clay-button" style={{ border: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 700 }} onClick={() => setShowAddModal('shop')}>
                    <Plus size={18} /> Add to Shop
                </button>
                <button className="clay-button primary" style={{ fontWeight: 700 }} onClick={() => setShowAddModal('inventory')}>
                    <Plus size={18} /> Add Private Stock
                </button>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Products', value: products.length, color: '#e0f2fe', accent: '#0369a1' },
                    { label: 'In Shop', value: products.filter(p => p.isSoldInShop).length, color: '#dcfce7', accent: '#166534' },
                    { label: 'Low Stock', value: products.filter(p => p.stock < 20).length, color: '#fee2e2', accent: '#991b1b' },
                    { label: 'Private Only', value: products.filter(p => !p.isSoldInShop).length, color: '#f3f4f6', accent: '#374151' },
                ].map(s => (
                    <div key={s.label} className="clay-card" style={{ background: s.color, border: 'none', padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.accent, marginBottom: '0.5rem' }}>{s.label.toUpperCase()}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: s.accent }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                    {[1, 2, 3, 4].map(n => <div key={n} className="clay-card" style={{ height: '320px', background: 'rgba(0,0,0,0.03)', animation: 'pulse 1.5s infinite ease-in-out' }} />)}
                </div>
            ) : (
                <>
                    {/* Shop products section */}
                    {shopItems.length > 0 && (
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>🛒 Live in Store <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}>{shopItems.length}</span></h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                                {shopItems.map(p => <ProductCard key={p.id} p={p} />)}
                            </div>
                        </div>
                    )}

                    {/* Private products section */}
                    {privateItems.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>🔒 Private Inventory <span style={{ background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}>{privateItems.length}</span></h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                                {privateItems.map(p => <ProductCard key={p.id} p={p} />)}
                            </div>
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div className="clay-card" style={{ padding: '6rem', textAlign: 'center' }}>
                            <Package size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <h3 style={{ opacity: 0.5 }}>No products found</h3>
                        </div>
                    )}
                </>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="clay-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', borderRadius: '40px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Add {showAddModal === 'shop' ? 'Shop Produce 🛒' : 'Private Stock 🔒'}</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', padding: 0 }} onClick={() => setShowAddModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={(e) => handleAdd(e, showAddModal === 'shop')} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Name</label>
                                <input type="text" className="clay-input" required placeholder="e.g. Red Apple (Kashmir)" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>SKU</label>
                                    <input type="text" className="clay-input" required placeholder="FR-001" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price (₨)</label>
                                    <input type="number" className="clay-input" required placeholder="1500" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Stock Qty</label>
                                    <input type="number" className="clay-input" required placeholder="100" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
                                    <select className="clay-input" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                        <option>Citrus</option><option>Apples</option><option>Mangoes</option><option>Tropical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Unit</label>
                                <select className="clay-input" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
                                    <option>Crates</option><option>Bags</option><option>Dozens</option>
                                </select>
                            </div>
                            <button type="submit" className="clay-button primary" style={{ height: '55px', marginTop: '0.5rem', fontWeight: 700 }}>
                                Register Stock
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="clay-card" style={{ maxWidth: '420px', width: '100%', padding: '3rem', borderRadius: '40px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Edit Product</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', padding: 0 }} onClick={() => setShowEditModal(null)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleUpdateStock} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Name</label>
                                <input type="text" className="clay-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Stock Qty</label>
                                    <input type="number" className="clay-input" value={editData.stock} onChange={e => setEditData({ ...editData, stock: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price (₨)</label>
                                    <input type="number" className="clay-input" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quality %</label>
                                    <input type="number" className="clay-input" value={editData.health} onChange={e => setEditData({ ...editData, health: e.target.value })} placeholder="85" />
                                </div>
                            </div>
                            <button type="submit" className="clay-button primary" style={{ height: '55px', fontWeight: 700 }}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── ORDER DETAIL MODAL ─────────────────────────────────────────── */
const OrderDetailModal = ({ order, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    if (!order) return null;

    // Safety check for items
    const items = order.orderItems || [];

    const formatDate = (dateString, withTime = false) => {
        if (!dateString) return 'N/A';
        const options = withTime
            ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem' }}>
            <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', cursor: 'pointer' }}
                onClick={onClose}
            ></div>

            <div className="clay-card modal-scale-up" style={{
                maxWidth: '1100px',
                width: '100%',
                padding: 0,
                borderRadius: '60px',
                background: 'white',
                overflow: 'hidden',
                display: 'flex',
                boxShadow: '0 50px 100px rgba(0,0,0,0.25)',
                border: 'none',
                maxHeight: '88vh',
                animation: 'scaleUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>

                {/* Admin Left Panel: Order Controller */}
                <div style={{ flex: '1.1', padding: '4.5rem', background: '#f8fafc', overflowY: 'auto', borderRight: '1px dashed rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3.5rem' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--primary)', letterSpacing: '2px', fontWeight: 900, fontSize: '0.8rem' }}>ADMIN CONTROL</h4>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginTop: '0.5rem', color: '#1a1a1a' }}>#{String(order._id || '').slice(-8).toUpperCase()}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }}>
                                <div style={{ padding: '0.5rem 1.2rem', borderRadius: '50px', background: order.isDelivered ? '#dcfce7' : '#fff7ed', color: order.isDelivered ? '#166534' : '#c2410c', fontWeight: 800, fontSize: '0.8rem' }}>
                                    {order.isDelivered ? '● DELIVERED' : '● PENDING ACTION'}
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{formatDate(order.createdAt, true)}</span>
                            </div>
                        </div>
                        <button className="clay-button" style={{ width: '60px', height: '60px', padding: 0, borderRadius: '50%', background: 'white' }} onClick={onClose}><X size={28} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3.5rem' }}>
                        <div className="clay-card" style={{ background: 'white', padding: '2rem', borderRadius: '35px', boxShadow: 'var(--clay-shadow-in)', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '1px' }}>CUSTOMER CONTACT</div>
                            <div style={{ fontWeight: 950, fontSize: '1.4rem', color: '#1a1a1a', marginBottom: '0.4rem' }}>{order.user?.username || 'Guest'}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>Direct Dispatch Tier</div>
                        </div>
                        <div className="clay-card" style={{ background: 'white', padding: '2rem', borderRadius: '35px', boxShadow: 'var(--clay-shadow-in)', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '1px' }}>REVENUE MODEL</div>
                            <div style={{ fontWeight: 950, fontSize: '1.4rem', color: '#1a1a1a', marginBottom: '0.4rem' }}>{order.paymentMethod || 'Cash'}</div>
                            <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: '0.85rem' }}>Cleared Transaction</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '3.5rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>SHIPPING LOGISTICS</div>
                        <div style={{ padding: '2.5rem', background: 'white', borderRadius: '40px', boxShadow: 'var(--clay-shadow-in)', position: 'relative', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '0.6rem' }}>{order.shippingAddress?.address || 'N/A'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{order.shippingAddress?.country}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', borderTop: '2px solid rgba(0,0,0,0.05)', paddingTop: '3rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.4rem' }}>TOTAL SETTLEMENT</div>
                            <div style={{ fontSize: '2.8rem', fontWeight: 950, color: 'var(--primary-dark)', letterSpacing: '-1px' }}>₨ {Number(order.totalPrice || 0).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button className="clay-button" style={{ height: '70px', padding: '0 2rem', fontWeight: 800, border: '2px solid #eee' }} onClick={() => window.print()}>Print Invoice</button>
                            {!order.isDelivered && (
                                <button className="clay-button primary" style={{ height: '70px', padding: '0 2.5rem', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 15px 30px rgba(76, 175, 125, 0.25)' }} onClick={() => alert('Order status updated to Shipped!')}>Ship Order</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admin Right Panel: Inventory Flow View */}
                <div style={{ flex: '0.9', background: 'white', padding: '4.5rem', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: 950, margin: 0, color: '#1a1a1a' }}>Inventory Flow</h3>
                        <div style={{ background: 'var(--mint-bg)', padding: '0.6rem 1.4rem', borderRadius: '18px', fontWeight: 900, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{items.length} SKUs</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1.8rem', padding: '1.8rem', background: '#f8fafc', borderRadius: '35px', border: '1px solid rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '90px', height: '90px', borderRadius: '25px', overflow: 'hidden', background: 'white', flexShrink: 0, boxShadow: 'var(--clay-shadow)' }}>
                                    <img src={item.image || (typeof getFruitImage === 'function' ? getFruitImage(item.name, '') : '')} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <h4 style={{ fontSize: '1.3rem', fontWeight: 950, margin: 0, color: '#1a1a1a' }}>{item.name}</h4>
                                        <b style={{ fontSize: '1.35rem', color: 'var(--primary-dark)' }}>₨ {(item.price * item.quantity).toLocaleString()}</b>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700 }}>
                                        {item.quantity} Units × <span style={{ opacity: 0.6 }}>₨ {item.price?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '4rem', padding: '2.5rem', background: '#f0fdf4', borderRadius: '40px', border: '1px solid #dcfce7' }}>
                        <div style={{ fontWeight: 900, color: '#166534', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '1px' }}>LOGISTICS MILESTONES</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {[
                                { status: 'Order Verified', time: formatDate(order.createdAt), done: true },
                                { status: 'Pick & Pack', time: formatDate(order.createdAt), done: true },
                                { status: 'Ready for Dispatch', time: 'In Progress', done: order.isDelivered }
                            ].map((m, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: m.done ? '#166534' : 'white', border: '2px solid #166534', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem' }}>{m.done && '✓'}</div>
                                    <div style={{ flex: 1, fontWeight: 700, color: '#1a1a1a' }}>{m.status}</div>
                                    <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.85rem', opacity: 0.7 }}>{m.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── ORDERS TAB ─────────────────────────────────────────────────── */
const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        api.get('/data/orders')
            .then(({ data }) => { setOrders(data); setLoading(false); })
            .catch(err => { console.error('Fetch orders failed', err); setLoading(false); });
    }, []);

    const handleDeliver = async (id) => {
        if (!window.confirm('Mark this order as delivered?')) return;
        try {
            await api.put(`/data/orders/${id}/deliver`);
            setOrders(orders.map(o => o._id === id ? { ...o, isDelivered: true, deliveredAt: new Date() } : o));
        } catch {
            alert('Could not update order status.');
        }
    };

    const filteredOrders = orders.filter(o =>
        (activeTab === 'All' || (activeTab === 'Delivered' ? o.isDelivered : !o.isDelivered)) &&
        (o._id.includes(searchTerm) || (o.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.6rem', background: 'rgba(0,0,0,0.04)', borderRadius: '18px', padding: '0.3rem' }}>
                    {['All', 'Pending', 'Delivered'].map(status => (
                        <button
                            key={status}
                            className="clay-button"
                            style={{
                                padding: '0.6rem 1.4rem',
                                border: 'none',
                                borderRadius: '15px',
                                background: activeTab === status ? 'var(--primary)' : 'transparent',
                                color: activeTab === status ? 'white' : 'var(--text-main)',
                                boxShadow: activeTab === status ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                                fontWeight: 700
                            }}
                            onClick={() => setActiveTab(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="clay-input" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'white', flex: 1, minWidth: '250px' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text" placeholder="Search by Order ID or Customer name..."
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {[1, 2, 3].map(n => <div key={n} className="clay-card" style={{ height: '220px', background: 'rgba(0,0,0,0.02)', animation: 'pulse 1.5s infinite' }} />)}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="clay-card" style={{ padding: '6rem', textAlign: 'center' }}>
                    <Package size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                    <h3 style={{ opacity: 0.5 }}>No matching orders found</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {filteredOrders.map(order => (
                        <div key={order._id} className="clay-card" style={{ padding: '2rem', background: 'white', border: '2px solid transparent', transition: 'all 0.3s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>#{order._id.slice(-8).toUpperCase()}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--soft-orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 900 }}>
                                            {order.user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <b style={{ fontSize: '1.1rem' }}>{order.user?.username || 'Guest Customer'}</b>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800,
                                    background: order.isDelivered ? '#dcfce7' : '#fff7ed',
                                    color: order.isDelivered ? '#166534' : '#c2410c'
                                }}>
                                    {order.isDelivered ? 'DELIVERED' : 'PENDING'}
                                </span>
                            </div>

                            <div style={{ background: 'var(--warm-bg)', borderRadius: '18px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORDER DATE</div>
                                    <div style={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL AMOUNT</div>
                                    <div style={{ fontWeight: 900, color: 'var(--primary-dark)', fontSize: '1.1rem' }}>₨ {order.totalPrice?.toLocaleString()}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button
                                    className="clay-button"
                                    style={{ flex: 1, padding: '0.7rem', fontSize: '0.85rem', background: '#eff6ff', color: '#1d4ed8', border: 'none', fontWeight: 700 }}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <Eye size={16} /> Details
                                </button>
                                {!order.isDelivered && (
                                    <button
                                        className="clay-button"
                                        style={{ flex: 1, padding: '0.7rem', fontSize: '0.85rem', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700 }}
                                        onClick={() => handleDeliver(order._id)}
                                    >
                                        <CheckCircle2 size={16} /> Ship Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Overall Stats Section */}
            <div style={{ marginTop: '4rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Performance Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    {[
                        { label: 'Total Sales', value: `₨ ${orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0).toLocaleString()}`, color: '#E3F2FD', text: '#0D47A1' },
                        { label: 'Pending', value: orders.filter(o => !o.isDelivered).length, color: '#FFF3E0', text: '#E65100' },
                        { label: 'Completed', value: orders.filter(o => o.isDelivered).length, color: '#E8F5E9', text: '#1B5E20' },
                        { label: 'Customers', value: new Set(orders.map(o => o.user?._id)).size, color: '#F3E5F5', text: '#4A148C' },
                    ].map(s => (
                        <div key={s.label} className="clay-card" style={{ background: s.color, border: 'none', padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: s.text, opacity: 0.7, marginBottom: '0.5rem' }}>{s.label.toUpperCase()}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.text }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
const AdminOrders = () => {
    const [activeSection, setActiveSection] = useState('store');

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
                        {activeSection === 'store' ? '🛒 Store Management' : '📦 Order Management'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        {activeSection === 'store'
                            ? 'Manage products, stock levels and what appears in the customer store'
                            : 'Monitor and manage all customer orders'}
                    </p>
                </div>

                {/* Tab switcher */}
                <div style={{ display: 'flex', gap: '0.6rem', background: 'rgba(0,0,0,0.04)', borderRadius: '18px', padding: '0.4rem' }}>
                    <button
                        className="clay-button"
                        style={{
                            padding: '0.8rem 1.6rem', borderRadius: '14px', border: 'none',
                            background: activeSection === 'store' ? 'var(--primary)' : 'transparent',
                            color: activeSection === 'store' ? 'white' : 'var(--text-main)',
                            fontWeight: 700, boxShadow: activeSection === 'store' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                        }}
                        onClick={() => setActiveSection('store')}
                    >
                        <Store size={16} style={{ marginRight: '6px' }} /> Store
                    </button>
                    <button
                        className="clay-button"
                        style={{
                            padding: '0.8rem 1.6rem', borderRadius: '14px', border: 'none',
                            background: activeSection === 'orders' ? 'var(--primary)' : 'transparent',
                            color: activeSection === 'orders' ? 'white' : 'var(--text-main)',
                            fontWeight: 700, boxShadow: activeSection === 'orders' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                        }}
                        onClick={() => setActiveSection('orders')}
                    >
                        <ShoppingBag size={16} style={{ marginRight: '6px' }} /> Orders
                    </button>
                </div>
            </div>

            {activeSection === 'store' ? <AdminStoreTab /> : <OrdersTab />}
        </div>
    );
};

export default AdminOrders;
