import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import FruitIcon from '../../components/FruitIcon';
import {
    Bell, ShoppingCart, Sparkles, ChevronRight, Star, Home, LayoutGrid, Package, User,
    ArrowLeft, X, ShieldCheck, MapPin, Search, SlidersHorizontal, Plus, CheckCircle2, Heart
} from 'lucide-react';

const StoreProducts = ({ cartItems, addToCart, favorites, toggleFavorite }) => {
    const navigate = useNavigate();

    // Images disabled by request; using animated fruit icons instead.
    const [showProduct, setShowProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState("");

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const favCount = favorites.length;

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchShopInventory = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setIsLoading(true);
        try {
            const { data } = await api.get('/data/inventory');
            if (data) {
                const shopItems = data.filter(p => p.isSoldInShop);
                setProducts(shopItems.map(p => ({
                    ...p,
                    id: p._id,
                    name: p.name || 'Premium Produce',
                    farm: p.farm || 'Local Mandi',
                    price: p.price || 500,
                    img: p.img || (
                        p.category === 'Apples' ? "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6" :
                            p.category === 'Bananas' ? "https://images.unsplash.com/photo-1543333309-87458118ce52" :
                                p.category === 'Grapes' ? "https://images.unsplash.com/photo-1537633552985-df8429e8048b" :
                                    p.category === 'Guava' ? "https://images.unsplash.com/photo-1534073828943-f801091bb18c" :
                                        p.category === 'Citrus' ? "https://images.unsplash.com/photo-1557800636-894a64c1696f" :
                                            p.category === 'Mangoes' ? "https://images.unsplash.com/photo-1553279768-865429fa0078" :
                                                "https://images.unsplash.com/photo-1610832958506-aa56368176cf"
                    ),
                    origin: p.origin || 'Faisalabad Mandi',
                    rating: p.rating || 4.5,
                    desc: p.desc || "Top-tier seasonal produce sourced directly from Mandi. Each batch is inspected for export-grade quality.",
                    category: p.category || 'Tropical',
                })));
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Store fetch fail:", err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShopInventory();

        // Keep store synced with admin inventory changes
        const onFocus = () => fetchShopInventory({ silent: true });
        window.addEventListener('focus', onFocus);

        const intervalId = window.setInterval(() => {
            fetchShopInventory({ silent: true });
        }, 5000);

        return () => {
            window.removeEventListener('focus', onFocus);
            window.clearInterval(intervalId);
        };
    }, [fetchShopInventory]);

    const isFavorite = (id) => favorites.some(p => p.id === id);

    const filtered = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 2200);
    };

    const handleAddToCart = (p) => {
        addToCart(p);
        showToast("Added to shopping bag!");
    };

    const handleToggleFav = (p) => {
        const wasFav = isFavorite(p.id);
        toggleFavorite(p);
        showToast(wasFav ? "Removed from favorites" : "Saved to favorites!");
    };

    const handleBuyNow = (p) => {
        addToCart(p, true); // True to clear cart first and force 1 quantity if we wanted
        navigate('/store/cart');
    };

    const clayShadowPuffy = "8px 8px 16px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.8), inset -2px -2px 6px rgba(0,0,0,0.05)";

    return (
        <div className="page-content" style={{ paddingBottom: '110px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '20px' }} />
                    <input
                        type="text"
                        className="clay-input"
                        placeholder="Search all premium fruits..."
                        style={{ paddingLeft: '3.5rem', width: '100%', height: '55px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="clay-button" style={{ height: '55px', width: '55px', padding: 0, background: 'white' }} onClick={() => alert('Filter options opening...')}><SlidersHorizontal size={24} color="#2D3436" /></button>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10001, animation: 'slideUpFade 0.3s ease-out' }}>
                    <div className="clay-card" style={{ background: 'var(--primary-dark)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <CheckCircle2 color="white" /> {toastMessage}
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {showProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div
                        style={{ position: 'absolute', inset: '1rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setShowProduct(null)}
                    ></div>
                    <div className="clay-card modal-scale-up" style={{ maxWidth: '1050px', width: '100%', padding: 0, borderRadius: '60px', background: 'white', overflow: 'hidden', display: 'flex', boxShadow: '0 50px 100px rgba(0,0,0,0.12)', border: 'none', maxHeight: '85vh', animation: 'scaleUp 0.3s ease-out' }}>
                        <div style={{ flex: '1.2', position: 'relative' }}>
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#f0fff4,#fff5e4)' }}>
                                <img src={showProduct.img} alt={showProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }} />
                            </div>
                            <button className="clay-button" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '56px', height: '56px', padding: 0, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: clayShadowPuffy, border: 'none', cursor: 'pointer' }} onClick={() => setShowProduct(null)}>
                                <X size={28} strokeWidth={2.5} color="#2D3436" />
                            </button>
                        </div>
                        <div style={{ flex: '1', padding: '4.5rem', display: 'flex', flexDirection: 'column', background: 'white', overflowY: 'auto' }}>
                            <div className="badge-clay" style={{ alignSelf: 'flex-start', marginBottom: '1.5rem', background: '#E8F5E9', color: '#2E7D32', padding: '0.6rem 1.4rem', borderRadius: '15px', fontWeight: 800 }}>
                                <ShieldCheck size={18} style={{ marginRight: '6px' }} /> QUALITY SEALED
                            </div>
                            <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#2D3436', lineHeight: '1.1' }}>{showProduct.name}</h2>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '2.5rem' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)' }}>₨ {showProduct.price}</div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>/ crate batch</span>
                                <span style={{ marginLeft: 'auto', background: showProduct.stock > 0 ? '#E8F5E9' : '#FFEBEE', color: showProduct.stock > 0 ? '#2E7D32' : '#C62828', padding: '0.4rem 0.8rem', borderRadius: '12px', fontWeight: 700 }}>
                                    {showProduct.stock > 0 ? `${showProduct.stock} Available` : 'Out of Stock'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><MapPin size={24} color="var(--primary)" /> <b style={{ fontSize: '1.15rem' }}>{showProduct.origin}</b></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Star size={24} color="#f57c00" fill="#f57c00" /> <b style={{ fontSize: '1.15rem' }}>{showProduct.rating}</b></div>
                            </div>
                            <p style={{ lineHeight: '1.9', color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3.5rem' }}>{showProduct.desc}</p>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto', paddingBottom: '1rem' }}>
                                <button className="clay-button" style={{ width: '80px', height: '80px', padding: 0, background: 'white', borderRadius: '26px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: clayShadowPuffy }} onClick={() => handleAddToCart(showProduct)}>
                                    <ShoppingCart size={32} color="var(--primary-dark)" />
                                </button>
                                <button className="clay-button primary" style={{ flex: 1, height: '80px', fontSize: '1.6rem', background: 'var(--primary-dark)', color: 'white', border: 'none', borderRadius: '26px', fontWeight: 800, boxShadow: '0 12px 30px rgba(45, 106, 79, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }} onClick={() => handleBuyNow(showProduct)}>
                                    <Plus size={24} /> Buy Now
                                </button>
                                <button className="clay-button" style={{ width: '80px', height: '80px', padding: 0, background: 'white', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: clayShadowPuffy, cursor: 'pointer' }} onClick={() => handleToggleFav(showProduct)}>
                                    <Star size={32} color={isFavorite(showProduct.id) ? "#f57c00" : "#2D3436"} fill={isFavorite(showProduct.id) ? "#f57c00" : "none"} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h2 style={{ marginBottom: '2.5rem', fontSize: '2.4rem', color: '#2D3436' }}>Full Produce Catalog</h2>

            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="clay-card" style={{ height: '350px', background: 'rgba(0,0,0,0.02)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="clay-card" style={{ padding: '6rem', textAlign: 'center' }}>
                    <Package size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
                    <h3 style={{ opacity: 0.5 }}>The store is currently empty</h3>
                    <p style={{ opacity: 0.4 }}>Check back later for fresh arrival of seasonal fruits.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {filtered.map((p, i) => (
                        <div key={i} className="clay-card product-card" onClick={() => setShowProduct(p)} style={{ cursor: 'pointer', background: 'white', borderRadius: '40px', padding: '1.5rem' }}>
                            <div className="product-img-container" style={{ borderRadius: '28px', height: '220px' }}>
                                <button className="clay-button" style={{ position: 'absolute', top: '10px', right: '10px', width: '38px', height: '38px', padding: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} onClick={(e) => { e.stopPropagation(); handleToggleFav(p); }}>
                                    <Star size={18} color={isFavorite(p.id) ? "#f57c00" : "#2D3436"} fill={isFavorite(p.id) ? "#f57c00" : "none"} />
                                </button>
                                {p.badge && <span className={`stock-badge ${p.badgeClass}`}>{p.badge}</span>}
                                <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            </div>
                            <div className="product-info" style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div><h4 style={{ margin: 0, fontSize: '1.4rem' }}>{p.name}</h4><div style={{ fontSize: '0.85rem', color: p.stock > 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.2rem', fontWeight: 600 }}>{p.stock > 0 ? `${p.stock} crates available` : 'Out of Stock'}</div></div>
                                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary-dark)' }}>₨ {p.price}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ background: '#FFF7ED', color: '#C2410C', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}><Star size={14} style={{ fill: 'currentColor', marginRight: '4px' }} /> {p.rating}</div>
                                    <div style={{ display: 'flex', gap: '0.6rem', flex: 1, justifyContent: 'flex-end' }}>
                                        <button className="clay-button" style={{ height: '48px', width: '48px', padding: 0, borderRadius: '14px', background: 'white', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}>
                                            <ShoppingCart size={20} color="var(--primary-dark)" />
                                        </button>
                                        <button className="clay-button primary" style={{ height: '48px', flex: 1, padding: '0 1rem', borderRadius: '14px', background: 'var(--primary-dark)', fontSize: '0.9rem', fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); handleBuyNow(p); }}>Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Nav */}
            <nav className="bottom-nav">
                <button className="bottom-nav-item" onClick={() => navigate('/store')}><Home /><span>Home</span></button>
                <button className="bottom-nav-item active" onClick={() => navigate('/store/products')}><LayoutGrid /><span>Shop</span></button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/cart')} style={{ position: 'relative' }}>
                    <ShoppingCart /><span>Cart</span>{cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/store')} style={{ position: 'relative' }}>
                    <Heart color={favCount > 0 ? "var(--danger)" : "currentColor"} fill={favCount > 0 ? "var(--danger)" : "none"} />
                    <span>Favorites</span>{favCount > 0 && <span className="cart-badge-count" style={{ background: 'var(--danger)' }}>{favCount}</span>}
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/profile')}><User /><span>Account</span></button>
            </nav>
        </div>
    );
};

export default StoreProducts;
