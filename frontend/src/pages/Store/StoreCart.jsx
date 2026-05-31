import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    Trash2,
    CreditCard,
    Home,
    LayoutGrid,
    ShoppingCart,
    Package,
    User,
    CheckCircle2,
    ArrowLeft,
    Heart,
    MapPin
} from 'lucide-react';

const StoreCart = ({ cartItems, removeFromCart, updateQuantity, clearCart }) => {
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [address, setAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'Pakistan'
    });
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const cleanStr = String(priceStr).replace(/[^0-9.]/g, '');
        return parseFloat(cleanStr) || 0;
    };

    const subtotal = cartItems.reduce((acc, item) => {
        const itemPrice = parsePrice(item.price);
        return acc + (itemPrice * item.quantity);
    }, 0);

    const total = subtotal; // No extra charges — price as shown
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    image: item.img,
                    price: parsePrice(item.price),
                    product: item.id
                })),
                shippingAddress: address,
                paymentMethod: 'Cash on Delivery',
                totalPrice: total
            };

            await api.post('/data/orders', orderData);
            setOrderSuccess(true);
            clearCart();
            setTimeout(() => navigate('/store/orders'), 3000);
        } catch (err) {
            alert('Failed to place order. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <div className="clay-card" style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px' }}>
                    <div style={{ color: 'var(--success)', marginBottom: '2rem' }}><CheckCircle2 size={80} /></div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Placed!</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>Your fresh produce will be delivered soon. Redirecting to order history...</p>
                    <button className="clay-button primary" onClick={() => navigate('/store/orders')}>View My Orders</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content" style={{ paddingBottom: '110px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '3.5rem' }}>
                <button 
                    className="clay-button" 
                    style={{ width: '45px', height: '45px', padding: 0, borderRadius: '50%', background: 'white' }}
                    onClick={() => isCheckingOut ? setIsCheckingOut(false) : navigate('/store/products')}
                >
                    <ArrowLeft size={20} color="var(--primary-dark)" />
                </button>
                <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 800 }}>{isCheckingOut ? 'Checkout' : 'Your Bag'}</h1>
            </div>

            <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: cartItems.length > 0 ? '1fr 400px' : '1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cartItems.length === 0 ? (
                        <div className="clay-card" style={{ padding: '8rem 2rem', textAlign: 'center', background: 'white', borderRadius: '40px' }}>
                            <div style={{ background: 'var(--warm-bg)', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                <ShoppingCart size={48} style={{ opacity: 0.2 }} />
                            </div>
                            <h2 style={{ marginBottom: '1rem', color: '#2D3436' }}>Your Bag is Empty</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Looks like you haven't added any fresh fruits yet.</p>
                            <button className="clay-button primary" onClick={() => navigate('/store/products')} style={{ background: 'var(--primary-dark)', padding: '1.2rem 3rem' }}>Start Shopping</button>
                        </div>
                    ) : isCheckingOut ? (
                        <div className="clay-card" style={{ padding: '3rem', background: 'white' }}>
                            <h3 style={{ marginBottom: '2rem' }}><MapPin size={20} style={{ marginRight: '10px' }} /> Shipping Details</h3>
                            <form onSubmit={handleCheckout}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label>Street Address</label>
                                    <input 
                                        type="text" className="clay-input" required 
                                        value={address.address} onChange={e => setAddress({...address, address: e.target.value})}
                                        placeholder="Flat / House No / Street"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label>City</label>
                                        <input 
                                            type="text" className="clay-input" required 
                                            value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                                            placeholder="e.g. Multan"
                                        />
                                    </div>
                                    <div>
                                        <label>Postal Code</label>
                                        <input 
                                            type="text" className="clay-input" required 
                                            value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})}
                                            placeholder="e.g. 60000"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label>Payment Method</label>
                                    <div className="clay-input" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--warm-bg)' }}>
                                        <input type="radio" checked readOnly /> <span>Cash on Delivery</span>
                                    </div>
                                </div>
                                <button type="submit" className="clay-button primary" disabled={loading} style={{ width: '100%', height: '60px' }}>
                                    {loading ? 'Confirming...' : 'Place Order'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        cartItems.map((item, i) => (
                            <div key={i} className="clay-card" style={{ display: 'flex', gap: '2rem', padding: '1.5rem', borderRadius: '32px', background: 'white', alignItems: 'center' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '20px', overflow: 'hidden', background: '#f8f8f8' }}>
                                    <img src={`${item.img}?q=80&w=200&auto=format&fit=crop`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#1a1a1a' }}>{item.name}</h4>
                                            <div style={{ fontSize: '1rem', color: 'var(--primary-dark)', fontWeight: 700 }}>₨ {item.price} / crate</div>
                                        </div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a1a' }}>₨ {(parsePrice(item.price) * item.quantity).toLocaleString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1.5rem' }}>
                                        <div className="quantity-control-clay" style={{ background: '#f5f5f5', borderRadius: '15px' }}>
                                            <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '0.4rem 0.8rem', fontSize: '1.4rem' }}>-</button>
                                            <span style={{ fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '0.4rem 0.8rem', fontSize: '1.4rem' }}>+</button>
                                        </div>
                                        <button 
                                            className="clay-button" 
                                            style={{ padding: '0.5rem', background: '#fff1f1', color: '#f87171', border: 'none', borderRadius: '12px' }}
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div>
                        <div className="clay-card" style={{ padding: '3.5rem', background: '#fdf8f4', borderRadius: '40px', position: 'sticky', top: '100px' }}>
                            <h3 style={{ marginBottom: '2.5rem', fontSize: '1.8rem', color: '#1a1a1a' }}>Order Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '1.1rem' }}>
                                    <span>Bag Subtotal</span>
                                    <span style={{ fontWeight: 700 }}>₨ {subtotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '1.1rem' }}>
                                    <span>Delivery Fee</span>
                                    <span style={{ color: 'var(--success)', fontWeight: 800 }}>FREE</span>
                                </div>
                                <hr style={{ border: 'none', borderTop: '2px dashed rgba(0,0,0,0.1)', margin: '1rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '2.2rem', color: 'var(--primary-dark)' }}>
                                    <span>Total</span>
                                    <span>₨ {total.toLocaleString()}</span>
                                </div>
                            </div>
                            {!isCheckingOut && (
                                <button 
                                    className="clay-button primary" 
                                    style={{ width: '100%', padding: '1.8rem', fontSize: '1.4rem', borderRadius: '24px', background: 'var(--primary-dark)', boxShadow: '0 15px 35px rgba(45, 106, 79, 0.3)' }} 
                                    onClick={() => setIsCheckingOut(true)}
                                >
                                    Proceed to Checkout <CreditCard size={24} style={{ marginLeft: '10px' }} />
                                </button>
                            )}
                            <div style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: '#2E7D32', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={16} /> Encrypted Gateway Active
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="bottom-nav">
                <button className="bottom-nav-item" onClick={() => navigate('/store')}><Home /><span>Home</span></button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/products')}><LayoutGrid /><span>Shop</span></button>
                <button className="bottom-nav-item active" onClick={() => navigate('/store/cart')} style={{ position: 'relative' }}>
                    <ShoppingCart /><span>Cart</span>{cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/store')}>
                    <Heart /><span>Favorites</span>
                </button>
                <button className="bottom-nav-item" onClick={() => navigate('/store/profile')}><User /><span>Account</span></button>
            </nav>
        </div>
    );
};

export default StoreCart;

