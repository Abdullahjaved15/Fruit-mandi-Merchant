import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, ArrowRight, BookOpen, Truck, ShoppingBag, Users, Check } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();
    const [clickCount, setClickCount] = useState(0);
    const clickTimer = useRef(null);
    const hiddenAdminPath = '/__portal';

    const handleLogoClick = () => {
        setClickCount(prev => prev + 1);

        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
        }

        if (clickCount + 1 >= 3) {
            setClickCount(0);
            navigate(hiddenAdminPath);
        } else {
            clickTimer.current = setTimeout(() => {
                setClickCount(0);
            }, 2000); // Reset after 2 seconds
        }
    };

    return (
        <div className="landing-container">
            {/* Floating Clay Fruits (Decorations) */}
            <div className="clay-fruit floating-clay" style={{ top: '15%', left: '5%', fontSize: '4rem' }}>🍎</div>
            <div className="clay-fruit floating-clay" style={{ top: '25%', right: '5%', fontSize: '5rem', animationDelay: '-2s' }}>🍊</div>
            <div className="clay-fruit floating-clay" style={{ bottom: '15%', left: '10%', fontSize: '3.5rem', animationDelay: '-4s' }}>🍇</div>
            <div className="clay-fruit floating-clay" style={{ bottom: '25%', right: '8%', fontSize: '4.5rem', animationDelay: '-1s' }}>🥭</div>

            {/* Sticky Navigation */}
            <nav className="landing-nav">
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', userSelect: 'none' }}
                    onClick={handleLogoClick}
                >
                    <div className="logo-icon" style={{ width: '50px', height: '50px', background: 'var(--primary)' }}><Leaf /></div>
                    <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.8rem', margin: '0', fontFamily: 'Poppins' }}>
                        Javed <span style={{ fontWeight: '300' }}>and Sons</span>
                    </h2>
                </div>
                <div className="nav-pill-group">
                    <a href="#features">Features</a>
                    <a href="#impact">Impact</a>
                    <a href="#contact">Contact</a>
                    <button
                        className="clay-button"
                        style={{ background: 'var(--primary)', color: 'white' }}
                        onClick={() => navigate('/login')}
                    >
                        Login/Register
                    </button>
                    <button
                        className="clay-button"
                        style={{ background: 'var(--peach)', color: '#8B4513' }}
                        onClick={() => navigate('/store')}
                    >
                        E-Commerce Store
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-anim"></div>
                <div className="hero-card" style={{ animation: 'slideUpFade 1s ease-out forwards' }}>
                    <div className="badge-clay"><Sparkles style={{ width: '16px' }} /> Agricultural Excellence</div>
                    <h1 className="hero-title">Elevate Your <span style={{ color: 'var(--soft-orange)' }}>Mandi</span> Business</h1>
                    <p className="hero-subtitle">
                        The most advanced end-to-end management tool designed specifically for Pakistani fruit merchants.
                        Manage ledgers, inventory, and online sales in one puffy, unified platform.
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                        <button
                            className="clay-button"
                            style={{ background: 'var(--primary-dark)', color: 'white', padding: '1.25rem 3rem', fontSize: '1.2rem' }}
                            onClick={() => navigate('/login')}
                        >
                            Get Started Free <ArrowRight />
                        </button>
                        <button
                            className="clay-button"
                            style={{ background: 'var(--cream)', color: 'var(--primary-dark)', padding: '1.25rem 3rem', fontSize: '1.2rem' }}
                            onClick={() => navigate('/store')}
                        >
                            Visit Mandi Store
                        </button>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <div className="clay-button" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', pointerEvents: 'none' }}>
                            <Check style={{ color: 'var(--success)' }} /> Verified Trade
                        </div>
                        <div className="clay-button" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', pointerEvents: 'none' }}>
                            <Check style={{ color: 'var(--success)' }} /> 500+ Arhtiyas
                        </div>
                        <div className="clay-button" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', pointerEvents: 'none' }}>
                            <Check style={{ color: 'var(--success)' }} /> 24/7 Support
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="landing-section" style={{ background: 'linear-gradient(135deg, #F0FFF4, #FFF5E4)' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--primary-dark)', marginBottom: '1.5rem' }}>Everything You Need</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        We have digitized the Mandi workflow so you can scale faster.
                    </p>
                </div>

                <div className="feature-grid">
                    <div className="clay-card mint">
                        <div className="feature-icon-wrapper"><BookOpen /></div>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>Digital Khata</h4>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Secure, error-free ledgers for every transaction. Backed up to the cloud instantly.
                        </p>
                    </div>
                    <div className="clay-card peach">
                        <div className="feature-icon-wrapper"><Truck /></div>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>Consignments</h4>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Automated "Mal Aana" tracking. Real-time freight and commission calculations.
                        </p>
                    </div>
                    <div className="clay-card lavender">
                        <div className="feature-icon-wrapper"><ShoppingBag /></div>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>B2B Store</h4>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Sell your inventory nationwide. Manage stock and orders directly in the app.
                        </p>
                    </div>
                    <div className="clay-card sky-blue">
                        <div className="feature-icon-wrapper"><Users /></div>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>HR & Payroll</h4>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Track attendance and generate payroll for your team with one click.
                        </p>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section id="impact" className="landing-section">
                <div className="clay-card" style={{ background: 'var(--cream)', overflow: 'visible' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2.8rem', color: 'var(--primary-dark)', marginBottom: '2rem' }}>Trusted by industry leaders.</h2>
                            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '2.5rem', fontStyle: 'italic' }}>
                                "Since switching to Javed & Sons Suite, our partner farms have seen a 40% reduction in
                                accounting errors and a massive boost in sales."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div className="clay-fruit" style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', boxShadow: 'var(--clay-shadow-puffy)' }}>
                                    <img src="https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?q=80&w=100&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0', color: 'var(--text-main)' }}>Haji Gulzar</h4>
                                    <p style={{ margin: '0', color: 'var(--text-muted)' }}>Sargodha Farms</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=600&auto=format&fit=crop" style={{ width: '100%', borderRadius: '40px', boxShadow: 'var(--clay-shadow-puffy)' }} />
                            <div className="impact-badge">
                                <div className="stat-number" style={{ color: 'var(--primary-dark)' }}>Rs 1.2B</div>
                                <div className="stat-label">Processed in 2025</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stats-row">
                    <div className="stat-card-clay">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Active Arhtiyas</span>
                    </div>
                    <div className="stat-card-clay" style={{ background: 'var(--peach)' }}>
                        <span className="stat-number">50k+</span>
                        <span className="stat-label">Monthly Sales</span>
                    </div>
                    <div className="stat-card-clay" style={{ background: 'var(--sky-blue)' }}>
                        <span className="stat-number">99.9%</span>
                        <span className="stat-label">Server Uptime</span>
                    </div>
                    <div className="stat-card-clay" style={{ background: 'var(--lavender)' }}>
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Direct Support</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" style={{ background: 'var(--primary-dark)', color: 'white', padding: '6rem 4rem 3rem', borderRadius: '60px 60px 0 0', marginTop: '4rem' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="logo-icon" style={{ background: 'var(--white)', color: 'var(--primary-dark)' }}><Leaf /></div>
                            <h2 style={{ fontSize: '2.rem', margin: '0' }}>Javed <span style={{ fontWeight: '300' }}>and Sons</span></h2>
                        </div>
                        <p style={{ lineHeight: '1.8', opacity: '0.8', maxWidth: '400px' }}>Empowering Pakistan's agricultural backbone through intelligent digital infrastructure.</p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2rem', fontSize: '1.3rem' }}>Explore</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: '0.8' }}>
                            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Platform Features</a>
                            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Success Stories</a>
                            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>B2B Marketplace</a>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2rem', fontSize: '1.3rem' }}>Contact</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: '0.8' }}>
                            <span>Multan Fruit Mandi, Punjab</span>
                            <span>+92 300 1234567</span>
                            <span>support@javedsons.com</span>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', opacity: '0.7' }}>
                    &copy; 2026 Javed & Sons | Designed with Claymorphism
                </div>
            </footer>
        </div>
    );
};

export default Landing;
