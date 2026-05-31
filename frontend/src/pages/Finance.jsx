import React, { useState, useMemo, useEffect } from 'react';
import api from '../api/axios';
import { 
    Search, Plus, Filter, Download, MoreVertical, Landmark, Wallet, Smartphone, ShieldCheck, 
    ArrowUpRight, ArrowDownLeft, X, DollarSign, FileText, CheckCircle2, ChevronDown
} from 'lucide-react';

const Finance = () => {
    const [vouchers, setVouchers] = useState([]);

    // Silently load real data from DB in background
    useEffect(() => {
        api.get('/data/finance')
            .then(({ data }) => { 
                if (data && data.length > 0) {
                    setVouchers(data.map(v => ({ 
                        ...v, 
                        id: v._id, // Use for API calls
                        voucherId: v.voucherId || v._id, // For display
                        category: v.category || 'Maintenance',
                        desc: v.desc || '-',
                        amount: v.amount || '0',
                        method: v.method || 'Cash',
                        type: v.type || 'debit',
                        date: v.date || new Date().toISOString().split('T')[0]
                    }))); 
                }
            })
            .catch((err) => console.error("Finance fetch fail:", err));
    }, []);

    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showFilterBar, setShowFilterBar] = useState(false);
    const [filterType, setFilterType] = useState("All");
    const [filterMethod, setFilterMethod] = useState("All");

    const [newExpense, setNewExpense] = useState({ category: 'Fuel', desc: '', amount: '', method: 'Cash' });

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const voucher = {
            voucherId: `#VOU-${1022 + vouchers.length}`,
            ...newExpense,
            type: 'debit',
            amount: newExpense.amount,
            date: new Date().toISOString().split('T')[0]
        };
        try {
            const { data } = await api.post('/data/finance', voucher);
            setVouchers([{...data, id: data._id, voucherId: data.voucherId || data._id}, ...vouchers]);
            setShowExpenseModal(false);
            setNewExpense({ category: 'Fuel', desc: '', amount: '', method: 'Cash' });
        } catch (err) {
            console.error("Finance save fail:", err);
            alert("Failed to record expense. Please try again.");
        }
    };

    const handleDeleteVoucher = async (id) => {
        if (window.confirm("Are you sure you want to remove this voucher record?")) {
            const prev = [...vouchers];
            setVouchers(vouchers.filter(v => v.id !== id));
            try {
                await api.delete(`/data/finance/${id}`);
                console.log("Voucher deleted from DB");
            } catch (err) {
                console.error("Finance delete fail:", err);
                setVouchers(prev);
                alert("Sync failed: Could not delete voucher from server.");
            }
        }
    };

    const filteredVouchers = useMemo(() => {
        return vouchers.filter(v => {
            const matchesType = filterType === "All" || v.type === filterType.toLowerCase();
            const matchesMethod = filterMethod === "All" || v.method === filterMethod;
            return matchesType && matchesMethod;
        });
    }, [vouchers, filterType, filterMethod]);

    const stats = useMemo(() => {
        const cash = vouchers.filter(v => v.method === 'Cash').reduce((acc, v) => acc + (v.type === 'credit' ? parseInt(v.amount) : -parseInt(v.amount)), 0);
        const bank = vouchers.filter(v => v.method === 'Bank').reduce((acc, v) => acc + (v.type === 'credit' ? parseInt(v.amount) : -parseInt(v.amount)), 0);
        const mobile = vouchers.filter(v => v.method === 'JazzCash' || v.method === 'EasyPaisa').reduce((acc, v) => acc + (v.type === 'credit' ? parseInt(v.amount) : -parseInt(v.amount)), 0);
        return { cash, bank, mobile };
    }, [vouchers]);

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Finance & Accounts</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor cash flow, bank balances, and secure transactions.</p>
                </div>
                <button className="clay-button primary" onClick={() => setShowExpenseModal(true)}><Plus size={20} /> Record Expense</button>
            </header>

            {/* Record Expense Modal */}
            {showExpenseModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem' }}>
                    {/* Organic Rounded Blur Backdrop */}
                    <div 
                        style={{ position: 'absolute', inset: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setShowExpenseModal(false)}
                    ></div>

                    {/* Floating Soft Decorative Blobs */}
                    <div style={{ position: 'absolute', top: '10%', right: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'var(--lavender)', filter: 'blur(100px)', opacity: 0.5, zIndex: -2 }}></div>
                    <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'var(--sky-blue)', filter: 'blur(100px)', opacity: 0.5, zIndex: -2 }}></div>

                    <div className="clay-card modal-scale-up" style={{ width: '100%', maxWidth: '520px', padding: '4rem', background: 'white', position: 'relative', borderRadius: '50px', boxShadow: '0 50px 100px rgba(0,0,0,0.12)' }}>
                        <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowExpenseModal(false)}>
                            <X size={28} color="#2D3436" strokeWidth={2.5} />
                        </button>
                        
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div className="badge-clay" style={{ display: 'inline-flex', marginBottom: '1rem', background: 'var(--warm-bg)' }}>
                                <DollarSign size={14} /> ACCOUNTING VOUCHER
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#2D3436' }}>Record Expense</h2>
                        </div>

                        <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, fontSize: '0.9rem' }}>Category</label>
                                <select className="clay-input" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                                    <option>Fuel</option>
                                    <option>Electricity Bill</option>
                                    <option>Stationery</option>
                                    <option>Rent</option>
                                    <option>Staff Tea/Entertainment</option>
                                    <option>Maintenance</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, fontSize: '0.9rem' }}>Description</label>
                                <input type="text" required className="clay-input" value={newExpense.desc} onChange={e => setNewExpense({...newExpense, desc: e.target.value})} placeholder="e.g. Printer ink and papers" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, fontSize: '0.9rem' }}>Amount (₨)</label>
                                    <input type="number" required className="clay-input" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} placeholder="1500" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, fontSize: '0.9rem' }}>Payment Via</label>
                                    <select className="clay-input" value={newExpense.method} onChange={e => setNewExpense({...newExpense, method: e.target.value})}>
                                        <option>Cash</option>
                                        <option>Bank</option>
                                        <option>JazzCash</option>
                                        <option>EasyPaisa</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="clay-button primary" style={{ height: '70px', fontSize: '1.3rem', marginTop: '1rem', borderRadius: '24px' }}>Save Voucher</button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="clay-card" style={{ cursor: 'pointer' }} onClick={() => setFilterMethod('Cash')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><Wallet /></div>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Cash on Hand</span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem' }}>₨ {stats.cash.toLocaleString()}</h2>
                </div>
                <div className="clay-card" style={{ cursor: 'pointer' }} onClick={() => setFilterMethod('Bank')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#e0f2fe', color: '#075985' }}><Landmark /></div>
                        <span style={{ color: '#0369a1', fontWeight: 'bold' }}>Bank Balance</span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem' }}>₨ {stats.bank.toLocaleString()}</h2>
                </div>
                <div className="clay-card" style={{ cursor: 'pointer' }} onClick={() => setFilterMethod('All')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><Smartphone /></div>
                        <span style={{ color: '#b45309', fontWeight: 'bold' }}>Mobile Wallets</span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem' }}>₨ {stats.mobile.toLocaleString()}</h2>
                </div>
            </div>

            <div className="clay-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Transaction Ledger</h3>
                        { (filterType !== 'All' || filterMethod !== 'All') && (
                            <button 
                                className="clay-chip" 
                                style={{ background: 'var(--warm-bg)', border: 'none', cursor: 'pointer' }}
                                onClick={() => { setFilterType('All'); setFilterMethod('All'); }}
                            >
                                Clear Filters <X size={12} />
                            </button>
                        ) }
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className={`clay-button ${showFilterBar ? 'primary' : ''}`} onClick={() => setShowFilterBar(!showFilterBar)}><Filter size={18} /> {showFilterBar ? 'Hide Filters' : 'Filter'}</button>
                        <button className="clay-button" onClick={() => alert('Exporting Ledger to CSV...')}>
                            <Download size={18} /> Export
                        </button>
                    </div>
                </div>

                {showFilterBar && (
                    <div className="clay-card" style={{ boxShadow: 'none', background: 'var(--warm-bg)', marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '3rem', animation: 'slideDownFade 0.2s ease-out' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>TRANSACTION TYPE</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['All', 'Debit', 'Credit'].map(t => (
                                    <button 
                                        key={t}
                                        className={`clay-button ${filterType === t ? 'primary' : ''}`} 
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                        onClick={() => setFilterType(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>PAYMENT METHOD</label>
                            <select 
                                className="clay-input" 
                                style={{ width: '200px', height: '45px' }} 
                                value={filterMethod}
                                onChange={(e) => setFilterMethod(e.target.value)}
                            >
                                <option>All</option>
                                <option>Cash</option>
                                <option>Bank</option>
                                <option>JazzCash</option>
                                <option>EasyPaisa</option>
                            </select>
                        </div>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Voucher & Date</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Category</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Description</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Amount</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Method</th>
                                <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVouchers.map((v, i) => (
                                <tr key={v.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{v.id}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{v.date}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <span className="clay-chip" style={{ background: 'white', fontSize: '0.8rem' }}>{v.category}</span>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem', fontSize: '0.95rem' }}>{v.desc}</td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: v.type === 'debit' ? '#ef4444' : '#22c55e', fontWeight: 800, fontSize: '1.1rem' }}>
                                            {v.type === 'debit' ? '-' : '+'} ₨ {parseInt(v.amount).toLocaleString()}
                                            {v.type === 'debit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.method === 'Cash' ? '#f59e0b' : v.method === 'Bank' ? '#3b82f6' : '#8b5cf6' }}></div>
                                            {v.method}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>
                                                <CheckCircle2 size={14} /> VERIFIED
                                            </div>
                                            <button className="clay-button" style={{ padding: '0.5rem', borderRadius: '10px', background: '#fff1f1', color: '#f87171', border: 'none' }} onClick={() => handleDeleteVoucher(v.id)} title="Delete Voucher">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredVouchers.length === 0 && (
                    <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <h3>No transactions found matching your filters</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Finance;
