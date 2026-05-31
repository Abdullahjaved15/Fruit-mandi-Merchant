import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import FruitIcon from '../../components/FruitIcon';
import { Bell, ShoppingCart, Sparkles, ChevronRight, Star, Home, LayoutGrid, Package, User, ArrowLeft, X, ShieldCheck, MapPin, Info, CheckCircle2, Heart, Plus } from 'lucide-react';

const StoreHome = ({ authData, cartItems, addToCart, favorites, toggleFavorite }) => {
    const navigate = useNavigate();

    // Images disabled by request; using animated fruit icons instead.
    const [selectedCategory, setSelectedCategory] = useState("All Fruits");
    const [showProduct, setShowProduct] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const favCount = favorites.length;

    const [allProducts, setAllProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchShopInventory = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setIsLoading(true);
        try {
            const { data } = await api.get('/data/inventory');
            if (data) {
                // Only show items that are explicitly marked for sale in shop
                const shopItems = data.filter(p => p.isSoldInShop);
                setAllProducts(shopItems.map(p => ({
                    ...p,
                    id: p._id,
                    name: p.name || 'Premium Produce',
                    farm: p.farm || 'Faisalabad Farms',
                    price: p.price || 400,
                    img: p.img || (
                        p.category === 'Apples' ? "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6" :
                            p.category === 'Bananas' ? "https://images.unsplash.com/photo-1543333309-87458118ce52" :
                                p.category === 'Grapes' ? "https://images.unsplash.com/photo-1537633552985-df8429e8048b" :
                                    p.category === 'Guava' ? "https://images.unsplash.com/photo-1534073828943-f801091bb18c" :
                                        p.category === 'Citrus' ? "https://images.unsplash.com/photo-1557800636-894a64c1696f" :
                                            p.category === 'Mangoes' ? "https://images.unsplash.com/photo-1553279768-865429fa0078" :
                                                "https://images.unsplash.com/photo-1610832958506-aa56368176cf"
                    ),
                    origin: p.origin || 'Punjab Orchards',
                    rating: p.rating || 4.7,
                    desc: p.desc || "Top-tier seasonal produce sourced directly from Mandi. Each batch is inspected for export-grade quality.",
                    category: p.category || 'Citrus',
                })));
            } else {
                setAllProducts([]);
            }
        } catch (err) {
            console.error("Store home fetch fail:", err);
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

    const filteredProducts = selectedCategory === "Favorites"
        ? favorites
        : selectedCategory === "All Fruits"
            ? allProducts
            : allProducts.filter(p => (p.category || '').toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase()));

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
        addToCart(p, true); // true to clear cart or just proceed
        navigate('/store/cart');
    };

    const categories = ["All Fruits", "Favorites", "Citrus (Malta)", "Apples (Saib)", "Mangoes (Aam)", "Grapes (Angoor)"];

    const clayShadowPuffy = "8px 8px 16px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.8), inset -2px -2px 6px rgba(0,0,0,0.05)";

    return (
        <div className="page-content" style={{ paddingBottom: '110px', position: 'relative' }}>
            <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'var(--mint-bg)', filter: 'blur(100px)', opacity: 0.3, zIndex: -1 }}></div>

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 100 }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', marginBottom: '0.2rem' }}>Kamyab Kissan <span style={{ fontWeight: '300', color: 'var(--primary)' }}>Store</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Premium Fruit Mandi Marketplace</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    <button className="clay-button" onClick={() => setSelectedCategory("Favorites")} style={{ position: 'relative', background: 'white', padding: '0.85rem' }}>
                        <Heart color={favCount > 0 ? "var(--danger)" : "var(--primary-dark)"} fill={favCount > 0 ? "var(--danger)" : "none"} />
                        {favCount > 0 && <span className="cart-badge-count" style={{ background: 'var(--danger)' }}>{favCount}</span>}
                    </button>
                    <button className="clay-button" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative', background: 'white', padding: '0.85rem' }}>
                        <Bell color="var(--primary-dark)" />
                        <span style={{ position: 'absolute', top: '5px', right: '5px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
                    </button>
                    <button className="clay-button primary" onClick={() => navigate('/store/cart')} style={{ position: 'relative', background: 'var(--primary-dark)', color: 'white', padding: '0.85rem' }}>
                        <ShoppingCart />
                        {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="clay-card" style={{ position: 'absolute', top: '70px', right: 0, width: '320px', zIndex: 1000, padding: '1.5rem', background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0 }}>Notifications</h4>
                                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>MARK ALL READ</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem', background: 'var(--warm-bg)', borderRadius: '15px' }}>
                                    <div style={{ color: 'var(--success)' }}><CheckCircle2 size={20} /></div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Order Dispatched</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Your order is being prepared and will ship soon.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10001, animation: 'slideUpFade 0.3s ease-out' }}>
                    <div className="clay-card" style={{ background: 'var(--primary-dark)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <CheckCircle2 color="white" /> {toastMessage}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showProduct && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div
                        style={{ position: 'absolute', inset: '1rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setShowProduct(null)}
                    ></div>
                    <div className="clay-card modal-scale-up" style={{ maxWidth: '1050px', width: '100%', padding: 0, borderRadius: '60px', background: 'white', overflow: 'hidden', display: 'flex', boxShadow: '0 50px 100px rgba(0,0,0,0.12)', border: 'none', height: 'auto', maxHeight: '85vh', transform: 'scale(1)', animation: 'scaleUp 0.3s ease-out' }}>
                        <div style={{ flex: '1.2', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#f0fff4,#fff5e4)' }}>
                                <img src={showProduct.img} alt={showProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }} />
                            </div>
                            <button className="clay-button" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '56px', height: '56px', padding: 0, background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: clayShadowPuffy, cursor: 'pointer', zIndex: 100 }} onClick={() => setShowProduct(null)}>
                                <X size={28} strokeWidth={2.5} color="#2D3436" />
                            </button>
                        </div>
                        <div style={{ flex: '1', padding: '4.5rem', display: 'flex', flexDirection: 'column', background: 'white', overflowY: 'auto' }}>
                            <div className="badge-clay" style={{ display: 'inline-flex', marginBottom: '1.5rem', background: '#E8F5E9', color: '#2E7D32', padding: '0.6rem 1.4rem' }}>
                                <ShieldCheck size={18} style={{ marginRight: '6px' }} /> QUALITY SEALED
                            </div>
                            <h2 style={{ fontSize: '3.5rem', color: '#2D3436', lineHeight: '1.1', marginBottom: '1rem' }}>{showProduct.name}</h2>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '2.5rem' }}>
                                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-dark)' }}>₨ {showProduct.price}</div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '1.15rem' }}>/ per crate batch</span>
                                <span style={{ marginLeft: 'auto', background: showProduct.stock > 0 ? '#E8F5E9' : '#FFEBEE', color: showProduct.stock > 0 ? '#2E7D32' : '#C62828', padding: '0.4rem 0.8rem', borderRadius: '12px', fontWeight: 700 }}>
                                    {showProduct.stock > 0 ? `${showProduct.stock} Available` : 'Out of Stock'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><MapPin size={24} color="var(--primary)" /> <b style={{ fontSize: '1.1rem' }}>{showProduct.origin}</b></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Star size={24} color="#f57c00" fill="#f57c00" /> <b style={{ fontSize: '1.1rem' }}>{showProduct.rating}</b></div>
                            </div>
                            <p style={{ lineHeight: '1.9', color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '4rem' }}>{showProduct.desc}</p>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto', paddingBottom: '1rem' }}>
                                <button className="clay-button" style={{ width: '80px', height: '80px', padding: 0, background: 'white', borderRadius: '28px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: clayShadowPuffy }} onClick={() => handleAddToCart(showProduct)}>
                                    <ShoppingCart size={32} color="var(--primary-dark)" />
                                </button>
                                <button className="clay-button primary" style={{ flex: 1, height: '80px', fontSize: '1.6rem', borderRadius: '28px', background: 'var(--primary-dark)', color: 'white', border: 'none', fontWeight: 800, boxShadow: '0 12px 30px rgba(45, 106, 79, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }} onClick={() => handleBuyNow(showProduct)}>
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

            {/* Hero */}
            <div className="store-hero" style={{ position: 'relative', marginBottom: '3.5rem', zIndex: 10 }}>
                <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(15px)', borderRadius: '40px', padding: '48px', boxShadow: '0 15px 50px rgba(0,0,0,0.06)', maxWidth: '580px' }}>
                    <div className="badge-clay" style={{ background: 'var(--warm-bg)', color: 'var(--primary)', marginBottom: '1.5rem' }}><Sparkles style={{ width: '14px' }} /> Seasonal Special</div>
                    <h2 style={{ fontSize: '3.2rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>Seasonal Harvest Collection <span style={{ color: 'var(--soft-orange)' }}>Is Live</span></h2>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '3rem' }}>Shop premium mandi produce from verified growers and enjoy the best available prices today.</p>
                    <button className="clay-button primary" style={{ background: 'var(--primary-dark)', padding: '1.2rem 3.5rem' }} onClick={() => navigate('/store/products')}>Shop Now <ChevronRight /></button>
                </div>
                <div className="floating-clay" style={{ position: 'absolute', right: '5%', top: '5%', fontSize: '9rem' }}>🍊</div>
            </div>

            {/* Feed */}
            <div style={{ background: 'linear-gradient(to bottom, #FBF8F3, #F0FFF4)', margin: '0 -4rem', padding: '5rem 4rem', borderRadius: '80px 80px 0 0', position: 'relative', zIndex: 5, minHeight: '900px', boxShadow: '0 -20px 60px rgba(0,0,0,0.03)' }}>
                <div style={{ marginBottom: '3.5rem' }}>
                    <h3 style={{ marginBottom: '1.8rem', fontSize: '1.8rem' }}>Browse Premium Produce</h3>
                    <div className="category-scroll">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                                style={{ background: selectedCategory === cat ? 'var(--primary)' : 'white', borderRadius: '18px', padding: '1rem 2rem', fontWeight: 700 }}
                            >
                                {cat === "Favorites" ? <Heart size={16} fill={favorites.length > 0 ? "currentColor" : "none"} color={favorites.length > 0 ? "white" : "currentColor"} style={{ marginRight: '6px' }} /> : null}
                                {cat}
                                {cat === "Favorites" && favCount > 0 && <span style={{ marginLeft: '10px', background: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>{favCount}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {[1, 2, 3].map(n => (
                            <div key={n} className="clay-card" style={{ height: '300px', background: 'rgba(0,0,0,0.02)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                        ))}
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.length === 0 ? (
                            <div className="clay-card" style={{ gridColumn: '1 / -1', padding: '6rem', textAlign: 'center', background: 'white' }}>
                                <Star size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                <h3 style={{ color: 'var(--text-muted)' }}>{selectedCategory === "Favorites" ? "No favorite fruits saved yet" : "No results for this category"}</h3>
                                <button className="clay-button" style={{ marginTop: '1.5rem' }} onClick={() => setSelectedCategory("All Fruits")}>Explore Store</button>
                            </div>
                        ) : (
                            filteredProducts.map((p) => (
                                <div key={p.id} className="clay-card product-card" onClick={() => setShowProduct(p)} style={{ cursor: 'pointer', background: 'white', borderRadius: '40px', padding: '1.5rem' }}>
                                    <div className="product-img-container" style={{ borderRadius: '28px', height: '220px' }}>
                                        <button className="clay-button" style={{ position: 'absolute', top: '10px', right: '10px', width: '38px', height: '38px', padding: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} onClick={(e) => { e.stopPropagation(); handleToggleFav(p); }}>
                                            <Star size={18} color={isFavorite(p.id) ? "#f57c00" : "#2D3436"} fill={isFavorite(p.id) ? "#f57c00" : "none"} />
                                        </button>
                                        <span className="stock-badge in-stock">Export Grade</span>
                                        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                                    </div>
                                    <div className="product-info" style={{ marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div><h4 style={{ margin: 0, fontSize: '1.4rem' }}>{p.name}</h4><div style={{ fontSize: '0.85rem', color: p.stock > 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.2rem', fontWeight: 600 }}>{p.stock > 0 ? `${p.stock} crates available` : 'Out of Stock'}</div></div>
                                            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary-dark)' }}>₨ {p.price}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                            <button className="clay-button" style={{ width: '55px', height: '55px', padding: 0, borderRadius: '15px', background: 'white', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}>
                                                <ShoppingCart size={22} color="var(--primary-dark)" />
                                            </button>
                                            <button className="clay-button primary" style={{ flex: 1, height: '55px', borderRadius: '15px', background: 'var(--primary-dark)', fontSize: '0.9rem', fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); handleBuyNow(p); }}>Buy Now</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <button className="bottom-nav-item active" onClick={() => navigate('/store')}><Home /><span>Home</span></button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/products')}><LayoutGrid /><span>Shop</span></button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/cart')} style={{ position: 'relative' }}>
                    <ShoppingCart /><span>Cart</span>{cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                </button>
                <button className="bottom-nav-item" onClick={() => setSelectedCategory("Favorites")} style={{ position: 'relative' }}>
                    <Heart color={favCount > 0 ? "var(--danger)" : "currentColor"} fill={favCount > 0 ? "var(--danger)" : "none"} />
                    <span>Favorites</span>{favCount > 0 && <span className="cart-badge-count" style={{ background: 'var(--danger)' }}>{favCount}</span>}
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/profile')}><User /><span>Account</span></button>
            </nav>
        </div>
    );
};

export default StoreHome;
