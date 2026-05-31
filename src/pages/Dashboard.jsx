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
    ArrowRight,
    PieChart as PieIcon,
    Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [activeView, setActiveView] = React.useState('Today');
    const [mandiStats, setMandiStats] = React.useState(null);
    const [inventory, setInventory] = React.useState([]);
    const [ledger, setLedger] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [statsRes, invRes, ledgerRes] = await Promise.all([
                api.get('/data/mandi-stats'),
                api.get('/data/inventory'),
                api.get('/data/ledger'),
            ]);
            setMandiStats(statsRes.data);
            setInventory(invRes.data || []);
            setLedger(ledgerRes.data || []);
        } catch (err) {
            console.error("Dashboard fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAllData();
    }, []);

    const todayShopSales = mandiStats?.todaySalesTotal || 0;
    const totalInventoryValue = inventory.reduce((acc, i) => acc + ((i.stock || 0) * (i.price || 0)), 0);
    const totalReceivables = mandiStats?.totalUdhaar || 0;
    const pendingSettlements = mandiStats?.pendingSettlements || 0;
    const activeConsignments = mandiStats?.activeConsignments || 0;

    // Process Ledger Data for Area Chart
    const chartData = ledger.slice(-7).map(t => ({
        name: t.date?.split(',')[0] || 'Day',
        income: t.type === 'income' ? t.amountRaw : 0,
        expense: t.type === 'expense' ? t.amountRaw : 0
    }));

    // Process Inventory for Pie Chart
    const pieData = inventory.slice(0, 5).map(item => ({
        name: item.name,
        value: item.stock
    }));
    const COLORS = ['#16a34a', '#f97316', '#3b82f6', '#7e22ce', '#ef4444'];

    return (
        <>
            {/* New Sale Modal */}
            {false && (
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
                <div className="dash-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div className="dash-greeting">
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Good Morning, Admin 👋</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{activeView === 'Today' ? new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : `${activeView}'s Performance`}</p>
                    </div>
                    <div className="dash-actions" style={{ display: 'flex', gap: '1rem' }}>
                        <button className="clay-button" onClick={() => setShowDatePicker(true)}><Calendar style={{ width: '18px' }} /> {activeView}</button>
                        <button className="clay-button primary" onClick={() => navigate('/shop-sales')} style={{ background: 'var(--primary-dark)', padding: '1rem 2rem' }}>
                            <Plus style={{ width: '18px' }} /> Shop Sale
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <button className="clay-button" onClick={() => navigate('/shop-sales')} style={{ background: 'var(--mint-bg)', padding: '1.5rem', justifyContent: 'center', gap: '1rem' }}><ShoppingCart style={{ width: '20px' }} /> Shop Sales</button>
                    <button className="clay-button" onClick={() => navigate('/settlements')} style={{ background: '#fff7ed', padding: '1.5rem', justifyContent: 'center', gap: '1rem' }}><Coins style={{ width: '20px' }} /> Settlements</button>
                    <button className="clay-button" onClick={() => navigate('/inventory')} style={{ background: '#e0f2fe', padding: '1.5rem', justifyContent: 'center', gap: '1rem' }}><Truck style={{ width: '20px' }} /> Inventory</button>
                    <button className="clay-button" onClick={() => navigate('/ledger')} style={{ background: '#f5f3ff', padding: '1.5rem', justifyContent: 'center', gap: '1rem' }}><FileText style={{ width: '20px' }} /> Ledger</button>
                </div>

                {/* Stat Cards */}
                <div className="stat-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="clay-card" style={{ background: '#D4F5E2', cursor: 'pointer' }} onClick={() => navigate('/shop-sales')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon" style={{ background: '#A3E4B8', padding: '0.5rem', borderRadius: '12px' }}><TrendingUp style={{ color: '#1a5c2e' }} /></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '10px' }}>LIVE</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Shop Sales Today</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>₨ {todayShopSales.toLocaleString()}</div>
                    </div>
                    <div className="clay-card" style={{ background: '#FFE8D6', cursor: 'pointer' }} onClick={() => navigate('/customers')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon" style={{ background: '#FFCBA4', padding: '0.5rem', borderRadius: '12px' }}><Wallet style={{ color: '#8B4513' }} /></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '10px' }}>LIVE</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Receivables</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>₨ {totalReceivables.toLocaleString()}</div>
                    </div>
                    <div className="clay-card" style={{ background: '#D6EDFF', cursor: 'pointer' }} onClick={() => navigate('/inventory')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon" style={{ background: '#A8D4F5', padding: '0.5rem', borderRadius: '12px' }}><Box style={{ color: '#0369a1' }} /></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '10px' }}>LIVE</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Inventory Value</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>₨ {totalInventoryValue.toLocaleString()}</div>
                    </div>
                    <div className="clay-card" style={{ background: '#EDE0FF', cursor: 'pointer' }} onClick={() => navigate('/settlements')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon" style={{ background: '#D4B8FF', padding: '0.5rem', borderRadius: '12px' }}><Coins style={{ color: '#7e22ce' }} /></div>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pending Settlements</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{pendingSettlements} draft · {activeConsignments} lots</div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="clay-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Activity size={22} color="var(--primary)" /> Financial Pulse</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last 7 Transactions</div>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#16a34a" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="clay-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}><PieIcon size={22} color="var(--accent)" /> Stock Allocation</h3>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                            {pieData.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                                    {item.name}
                                </div>
                            ))}
                            {pieData.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No inventory data</span>}
                        </div>
                    </div>
                </div>

                {/* Bottom Feed */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="clay-card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Flame style={{ width: '20px', color: 'var(--accent)' }} /> Top Selling Fruits
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {inventory.length > 0 ? (
                                inventory.slice(0, 3).map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--warm-bg)', borderRadius: '15px' }}>
                                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>{item.stock} in stock</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No inventory data available.</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="clay-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Recent Ledger Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {ledger.length > 0 ? (
                                ledger.slice(-3).reverse().map((t, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontWeight: 500 }}>{t.party}</span>
                                        <span style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                                            {t.type === 'income' ? '+' : '-'} ₨ {t.amountRaw.toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet.</div>
                            )}
                        </div>
                        <button className="clay-button" onClick={() => navigate('/ledger')} style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', fontSize: '0.85rem' }}>View All Transactions</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
