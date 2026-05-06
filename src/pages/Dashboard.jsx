import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    AlertTriangle,
    Calendar,
    Plus,
    UserPlus,
    Banknote,
    Truck,
    ShoppingCart,
    FileText,
    TrendingUp,
    Wallet,
    Box,
    Coins,
    BarChart2,
    Flame,
    ArrowRight
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [showNewSale, setShowNewSale] = React.useState(false);
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [activeView, setActiveView] = React.useState('Today');
    const [chartPeriod, setChartPeriod] = React.useState('Weekly');
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const chartData = {
        Weekly: [],
        Monthly: [],
        Yearly: []
    };

    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/data/orders');
                setOrders(data);
            } catch (err) {
                console.error("Fetch orders failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const totalStoreSales = orders.reduce((acc, o) => acc + o.totalPrice, 0);

    return (
        <>
            {/* New Sale Modal */}
            {showNewSale && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', borderRadius: '45px', animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Record New Sale</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', borderRadius: '12px', color: 'var(--danger)', boxShadow: 'none', background: 'rgba(255,0,0,0.05)' }} onClick={() => setShowNewSale(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Crate Type</label>
                                <select className="clay-input" style={{ width: '100%', borderRadius: '18px', height: '52px' }}>
                                    <option>Kinnow Orange 🍊</option>
                                    <option>Red Apple 🍎</option>
                                    <option>Mango 🥭</option>
                                    <option>Grapes 🍇</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quantity</label>
                                    <input type="number" className="clay-input" placeholder="0" style={{ width: '100%', borderRadius: '18px', height: '52px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Price/Crate</label>
                                    <input type="number" className="clay-input" placeholder="₨" style={{ width: '100%', borderRadius: '18px', height: '52px' }} />
                                </div>
                            </div>
                            <button className="clay-button primary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', height: '60px', borderRadius: '22px', fontSize: '1.1rem', fontWeight: 700 }} onClick={() => { alert('Sale recorded successfully!'); setShowNewSale(false); }}>Record Transaction</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Picker Modal */}
            {showDatePicker && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="clay-card" style={{ maxWidth: '380px', width: '100%', padding: '2.5rem', borderRadius: '48px', textAlign: 'center', background: 'white', animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                        <h3 style={{ marginBottom: '1.8rem', fontSize: '1.6rem', fontWeight: 800 }}>Select View</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {['Today', 'Yesterday', 'This Week'].map((view) => (
                                <button 
                                    key={view}
                                    className={`clay-button ${activeView === view ? 'primary' : ''}`} 
                                    style={{ height: '55px', borderRadius: '20px', fontSize: '1rem', justifyContent: 'center' }}
                                    onClick={() => { setActiveView(view); setShowDatePicker(false); }}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>
                        <button className="clay-button" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', borderRadius: '20px', border: 'none', background: 'transparent' }} onClick={() => setShowDatePicker(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="page-content">
            {/* Top Bar */}
            <div className="dash-topbar">
                <div className="dash-greeting">
                    <h1>Good Morning, Admin 👋</h1>
                    <p>{activeView === 'Today' ? new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : `${activeView}'s Performance`}</p>
                </div>
                <div className="dash-actions">
                    <button className="clay-button" onClick={() => setShowDatePicker(true)}><Calendar style={{ width: '18px' }} /> {activeView}</button>
                    <button className="clay-button primary" onClick={() => setShowNewSale(true)} style={{ background: 'var(--primary-dark)', padding: '1rem 2rem' }}>
                        <Plus style={{ width: '18px' }} /> New Sale
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <button className="clay-button" onClick={() => navigate('/beyparis')} style={{ background: 'var(--mint)' }}><UserPlus style={{ width: '16px' }} /> Add Beypar</button>
                <button className="clay-button" onClick={() => navigate('/admin/orders')} style={{ background: 'var(--peach)' }}><ShoppingCart style={{ width: '16px' }} /> Manage Orders</button>
                <button className="clay-button" onClick={() => navigate('/inventory')} style={{ background: 'var(--sky-blue)' }}><Truck style={{ width: '16px' }} /> New Consignment</button>
                <button className="clay-button" onClick={() => navigate('/reports')} style={{ background: 'var(--lavender)' }}><FileText style={{ width: '16px' }} /> Generate Report</button>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards-row">
                <div className="stat-card" style={{ background: '#D4F5E2', cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#A3E4B8' }}><TrendingUp style={{ color: '#1a5c2e' }} /></div>
                        <span className="stat-badge positive">Live</span>
                    </div>
                    <div className="stat-label">Store Sales</div>
                    <div className="stat-value">PKR {totalStoreSales.toLocaleString()}</div>
                    <div className="sparkline">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} className="bar" style={{ height: `${h}%`, background: '#6BCB8B' }}></div>
                        ))}
                    </div>
                </div>
                {/* ... other cards ... */}
                <div className="stat-card" style={{ background: '#FFE8D6', cursor: 'pointer' }} onClick={() => navigate('/udhaar')}>
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#FFCBA4' }}><Wallet style={{ color: '#8B4513' }} /></div>
                        <span className="stat-badge positive">0%</span>
                    </div>
                    <div className="stat-label">Total Receivables</div>
                    <div className="stat-value">PKR 0</div>
                    <div className="sparkline">
                        {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                            <div key={i} className="bar" style={{ height: `10%`, background: '#FFB07C' }}></div>
                        ))}
                    </div>
                </div>
                <div className="stat-card" style={{ background: '#D6EDFF', cursor: 'pointer' }} onClick={() => navigate('/inventory')}>
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#A8D4F5' }}><Box style={{ color: '#0369a1' }} /></div>
                        <span className="stat-badge positive">0%</span>
                    </div>
                    <div className="stat-label">Inventory Value</div>
                    <div className="stat-value">PKR 0</div>
                    <div className="sparkline">
                        {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                            <div key={i} className="bar" style={{ height: `10%`, background: '#7CC0E8' }}></div>
                        ))}
                    </div>
                </div>
                <div className="stat-card" style={{ background: '#EDE0FF', cursor: 'pointer' }} onClick={() => navigate('/commission')}>
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#D4B8FF' }}><Coins style={{ color: '#7e22ce' }} /></div>
                        <span className="stat-badge positive">0%</span>
                    </div>
                    <div className="stat-label">Commission Earned</div>
                    <div className="stat-value">PKR 0</div>
                    <div className="sparkline">
                        {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                            <div key={i} className="bar" style={{ height: `10%`, background: '#C4A8F0' }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart + Beyparis */}
            <div className="chart-container">
                <div className="clay-card cream-bg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart2 style={{ width: '20px' }} /> {chartPeriod} Performance
                        </h3>
                        <div className="chart-tabs">
                            {['Weekly', 'Monthly', 'Yearly'].map(period => (
                                <button
                                    key={period}
                                    className={`chart-tab ${chartPeriod === period ? 'active' : ''}`}
                                    onClick={() => setChartPeriod(period)}
                                >{period}</button>
                            ))}
                        </div>
                    </div>
                    <div className="clay-bar-chart">
                        <div className="chart-avg-line" style={{ bottom: '60%' }}><span>Avg ₨ {chartPeriod === 'Weekly' ? '38k' : chartPeriod === 'Monthly' ? '2.1L' : '9L'}</span></div>
                        {chartData[chartPeriod].map((d, i) => (
                            <div key={i} className="clay-bar" style={{ height: `${d.value}%`, flex: chartPeriod === 'Yearly' ? '0 0 7%' : undefined }} onClick={() => alert(`Sales for ${d.label}: ₨ ${d.raw}`)}>
                                <span className="bar-label" style={{ fontSize: chartPeriod === 'Yearly' ? '0.6rem' : undefined }}>{d.label}</span>
                                <span className="bar-tooltip">₨ {d.raw}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="clay-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity to show.</div>
                    <button className="clay-button" onClick={() => navigate('/beyparis')} style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center', fontSize: '0.85rem' }}>View All Beyparis</button>
                </div>
            </div>

            {/* Top Selling Fruits */}
            <div className="clay-card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Flame style={{ width: '20px', color: 'var(--accent)' }} /> Top Selling Fruits Today
                </h3>
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sales data for today.</div>
            </div>
            </div>
        </>
    );
};

export default Dashboard;
