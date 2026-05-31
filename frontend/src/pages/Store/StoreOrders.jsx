import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ChevronRight, ArrowLeft, Home, LayoutGrid, ShoppingCart, Heart, User, X, MapPin, CreditCard, Leaf, Info } from 'lucide-react';

// Order Detail Modal
// Order Detail Modal
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            {/* Backdrop with Blur — covering everything including sidebar */}
            <div 
                style={{ position: 'absolute', inset: 0, background: 'rgba(255, 245, 230, 0.4)', backdropFilter: 'blur(12px)', cursor: 'pointer' }}
                onClick={onClose}
            ></div>

            {/* Premium Split Card Modal */}
            <div className="clay-card modal-scale-up" style={{ 
                maxWidth: '1100px', 
                width: '100%', 
                padding: 0, 
                borderRadius: '60px', 
                background: 'white', 
                overflow: 'hidden', 
                display: 'flex', 
                boxShadow: '0 50px 100px rgba(0,0,0,0.18)', 
                border: 'none', 
                maxHeight: '88vh',
                animation: 'scaleUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                
                {/* Left Panel: Invoice & Details (Scrollable) */}
                <div style={{ flex: '1', padding: '4.5rem', background: '#fefcf9', overflowY: 'auto', borderRight: '1px dashed rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
                        <div>
                             <h4 style={{ margin: 0, color: 'var(--primary)', letterSpacing: '2.5px', fontWeight: 900, fontSize: '0.85rem' }}>OFFICIAL INVOICE</h4>
                             <h2 style={{ fontSize: '2.8rem', fontWeight: 950, color: 'var(--primary-dark)', marginTop: '0.6rem', letterSpacing: '-1px' }}>#{String(order._id || '').slice(-8).toUpperCase()}</h2>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.2rem' }}>
                                <div style={{ padding: '0.6rem 1.4rem', borderRadius: '50px', background: order.isDelivered ? '#dcfce7' : '#fff7ed', color: order.isDelivered ? '#166534' : '#c2410c', fontWeight: 900, fontSize: '0.8rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {order.isDelivered ? '● DELIVERED' : '● PROCESSING'}
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>{formatDate(order.createdAt, true)}</span>
                             </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(76, 175, 125, 0.3)' }}>
                                <Package color="white" size={32} />
                            </div>
                            <b style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-dark)' }}>Javed & Sons</b>
                        </div>
                    </div>

                    {/* Section: Delivery Details */}
                    <div style={{ marginBottom: '3.5rem' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-shadow)' }}>📍</div>
                            SHIPPING DESTINATION
                        </div>
                        <div style={{ padding: '2.5rem', background: 'white', borderRadius: '40px', boxShadow: 'var(--clay-shadow-in)', position: 'relative', border: '1px solid rgba(0,0,0,0.03)' }}>
                             <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '0.8rem', lineHeight: '1.4' }}>{order.shippingAddress?.address || 'N/A'}</div>
                             <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>{order.shippingAddress?.city || '-'}, {order.shippingAddress?.postalCode || '-'}</div>
                             <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{order.shippingAddress?.country || '-'}</div>
                        </div>
                    </div>

                    {/* Section: Transaction Summary */}
                    <div style={{ marginBottom: '4rem' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-shadow)' }}>💳</div>
                            TRANSACTION SUMMARY
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '1.15rem', fontWeight: 500 }}>
                                <span>Subtotal</span>
                                <b>₨ {Number(order.totalPrice || 0).toLocaleString()}</b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontSize: '1.15rem', fontWeight: 700 }}>
                                <span>Delivery Fee</span>
                                <b>FREE</b>
                            </div>
                            <hr style={{ border: 'none', borderTop: '2px dashed rgba(0,0,0,0.1)', margin: '1rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.6rem', fontWeight: 950, color: '#1a1a1a' }}>Grand Total</span>
                                <span style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--primary-dark)', letterSpacing: '-1px' }}>₨ {Number(order.totalPrice || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <button className="clay-button primary" onClick={() => window.print()} style={{ flex: 1, padding: '1.2rem', height: '75px', fontSize: '1.3rem', borderRadius: '25px', boxShadow: '0 20px 40px rgba(76, 175, 125, 0.25)' }}>Download PDF</button>
                        <button className="clay-button" onClick={onClose} style={{ flex: 1, padding: '1.2rem', height: '75px', fontSize: '1.3rem', background: 'white', border: 'none', borderRadius: '25px', boxShadow: 'var(--clay-shadow)', fontWeight: 800 }}>Close View</button>
                    </div>
                </div>

                {/* Right Panel: Items List (White) — with full Pack List detail */}
                <div style={{ flex: '0.8', background: 'white', display: 'flex', flexDirection: 'column', height: 'auto', minHeight: '100%' }}>
                    <div style={{ padding: '4.5rem 4rem 2rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '2rem', fontWeight: 950, margin: 0, color: '#1a1a1a' }}>Pack List</h3>
                            <div style={{ background: 'var(--mint-bg)', padding: '0.6rem 1.4rem', borderRadius: '18px', fontWeight: 900, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{items.length} Products</div>
                         </div>
                    </div>

                    <div style={{ padding: '0 4rem 4rem', overflowY: 'auto', flex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1.8rem', padding: '1.8rem', background: '#f8fafc', borderRadius: '35px', border: '1px solid rgba(0,0,0,0.01)', position: 'relative' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '25px', overflow: 'hidden', background: 'white', flexShrink: 0, boxShadow: 'var(--clay-shadow)' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <h4 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0, color: '#1a1a1a' }}>{item.name}</h4>
                                            <b style={{ fontSize: '1.4rem', color: 'var(--primary-dark)' }}>₨ {(item.price * item.quantity).toLocaleString()}</b>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700 }}>
                                            Qty: {item.quantity} × <span style={{ opacity: 0.6 }}>₨ {item.price?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                         {/* Track Order Timeline Component */}
                         <div style={{ marginTop: '5rem', padding: '2.5rem', background: 'rgba(76, 175, 125, 0.04)', borderRadius: '40px', border: '1px solid var(--primary-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)' }}></div>
                                <span style={{ fontWeight: 900, color: 'var(--primary-dark)', fontSize: '1rem', letterSpacing: '1.5px' }}>TRACKING TIMELINE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '2.5rem', padding: '0 1rem' }}>
                                <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '4px', background: 'rgba(0,0,0,0.05)', zIndex: 0, borderRadius: '2px' }}></div>
                                <div style={{ position: 'absolute', top: '14px', left: '10%', width: order.isDelivered ? '80%' : '15%', height: '4px', background: 'var(--primary)', zIndex: 0, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '2px' }}></div>
                                
                                {['Placed', 'Pack', 'Ship', 'Ready'].map((step, sidx) => (
                                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                        <div style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%', 
                                            background: sidx === 0 || (order.isDelivered && sidx <= 3) ? 'var(--primary)' : 'white', 
                                            border: `3px solid ${sidx === 0 || (order.isDelivered && sidx <= 3) ? 'var(--primary)' : '#eee'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: sidx === 0 || (order.isDelivered && sidx <= 3) ? 'white' : 'var(--text-muted)',
                                            fontSize: '0.8rem',
                                            fontWeight: 950,
                                            boxShadow: sidx === 0 || (order.isDelivered && sidx <= 3) ? '0 5px 15px rgba(76, 175, 125, 0.4)' : 'none',
                                            transition: 'all 0.4s'
                                        }}>
                                            {sidx === 0 || (order.isDelivered && sidx <= 3) ? '✓' : ''}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: sidx === 0 || (order.isDelivered && sidx <= 3) ? 'var(--primary-dark)' : 'var(--text-muted)' }}>{step}</span>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StoreOrders = ({ cartCount }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/data/orders/myorders');
                setOrders(data);
            } catch (err) {
                console.error("Fetch orders failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="page-content" style={{ paddingBottom: '110px' }}>
            {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '3.5rem' }}>
                <button 
                    className="clay-button" 
                    style={{ width: '45px', height: '45px', padding: 0, borderRadius: '50%', background: 'white' }}
                    onClick={() => navigate('/store')}
                >
                    <ArrowLeft size={20} color="var(--primary-dark)" />
                </button>
                <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 800 }}>My Orders</h1>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {[1, 2].map(n => (
                        <div key={n} className="clay-cardSkeleton" style={{ height: '150px', background: 'rgba(0,0,0,0.02)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '32px' }}></div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="clay-card" style={{ padding: '6rem 2rem', textAlign: 'center', background: 'white', borderRadius: '40px' }}>
                    <div style={{ background: 'var(--warm-bg)', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Package size={48} style={{ opacity: 0.2 }} />
                    </div>
                    <h2 style={{ marginBottom: '1rem' }}>No Orders Found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>You haven't placed any orders yet.</p>
                    <button className="clay-button primary" onClick={() => navigate('/store/products')}>Start Shopping</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {orders.map((order) => (
                        <div key={order._id} className="clay-card" style={{ padding: '2rem', background: 'white', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>ORDER #{order._id.slice(-8).toUpperCase()}</div>
                                    <div style={{ fontWeight: 700 }}>Placed on {formatDate(order.createdAt)}</div>
                                </div>
                                <div style={{ 
                                    padding: '0.5rem 1.2rem', 
                                    borderRadius: '12px', 
                                    background: order.isDelivered ? '#E8F5E9' : '#FFF3E0', 
                                    color: order.isDelivered ? '#2E7D32' : '#E65100',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    {order.isDelivered ? <><CheckCircle2 size={16} /> Delivered</> : <><Clock size={16} /> Pending</>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} style={{ flexShrink: 0, width: '80px', textAlign: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '15px', overflow: 'hidden', marginBottom: '0.5rem', background: '#f8f8f8' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>x{item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Total: ₨ {order.totalPrice.toLocaleString()}</div>
                                <button 
                                    className="clay-button" 
                                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-dark)', color: 'white', border: 'none' }}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    Order Details <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Nav */}
            <nav className="bottom-nav">
                <button className="bottom-nav-item" onClick={() => navigate('/store')}><Home /><span>Home</span></button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/products')}><LayoutGrid /><span>Shop</span></button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/cart')} style={{ position: 'relative' }}>
                    <ShoppingCart /><span>Cart</span>{cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                </button>
                <button className="bottom-nav-item active" onClick={() => navigate('/store/orders')}>
                    <Package /><span>Orders</span>
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/settings')}><User /><span>Account</span></button>
            </nav>
        </div>
    );
};

export default StoreOrders;
