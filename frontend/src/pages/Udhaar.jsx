import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Filter, Download, MoreVertical, CheckCircle, Clock, AlertCircle, X, DollarSign, Calendar, User, ShieldCheck } from 'lucide-react';

const Udhaar = () => {
    const [udhaarItems, setUdhaarItems] = useState([]);

    // Silently load real data from DB in background
    useEffect(() => {
        api.get('/data/customers')
            .then(({ data }) => { 
                if (data && data.length > 0) {
                    setUdhaarItems(data.filter(c => (c.udhaarRaw || 0) > 0).map(c => {
                        const ref = c.lastPaymentAt || c.updatedAt || c.createdAt;
                        const days = ref ? Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                        return {
                            id: c._id,
                            customer: c.name || 'Unknown',
                            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : 'N/A',
                            dueRaw: c.udhaarRaw || 0,
                            due: c.udhaar || `PKR ${(c.udhaarRaw || 0).toLocaleString()}`,
                            assignedCopybook: c.assignedCopybook || '',
                            aging: days,
                            agingText: `${days} Days`,
                            agingColor: days > 60 ? 'danger' : days > 30 ? 'accent' : 'success'
                        };
                    })); 
                }
            })
            .catch((err) => console.error("Udhaar fetch fail:", err));
    }, []);

    const [filterType, setFilterType] = useState('All Customers');
    const [showPaymentModal, setShowPaymentModal] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [copybookStaff, setCopybookStaff] = useState('STAFF-A');

    const handleExport = () => {
        const headers = ["Customer", "Invoice Date", "Total Due", "Aging (Days)"];
        const csvContent = [
            headers.join(","),
            ...udhaarItems.map(u => `${u.customer},${u.date},${u.dueRaw},${u.aging}`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Udhaar_Ledger_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!showPaymentModal) return;
        const amount = parseInt(paymentAmount, 10) || 0;
        const prev = udhaarItems;
        setUdhaarItems((p) =>
            p
                .map((item) => {
                    if (item.id === showPaymentModal.id) {
                        const newDueRaw = Math.max(0, item.dueRaw - amount);
                        return { ...item, dueRaw: newDueRaw, due: `PKR ${newDueRaw.toLocaleString()}` };
                    }
                    return item;
                })
                .filter((item) => item.dueRaw > 0)
        );
        setShowPaymentModal(null);
        setPaymentAmount('');
        try {
            await api.post(`/data/customers/${showPaymentModal.id}/payments`, {
                amount,
                copybookStaff,
                method: 'cash',
            });
        } catch (err) {
            setUdhaarItems(prev);
            console.error('Udhaar payment fail:', err);
            alert('Failed to record payment. Please try again.');
        }
    };

    const filteredItems = udhaarItems.filter(item => {
        if (filterType === 'Overdue Only') return item.aging > 30;
        return true;
    });

    const stats = {
        shortTerm: udhaarItems.filter(u => u.aging <= 7 && u.aging >= 0).reduce((acc, u) => acc + u.dueRaw, 0),
        midTerm: udhaarItems.filter(u => u.aging > 7 && u.aging <= 30).reduce((acc, u) => acc + u.dueRaw, 0),
        longTerm: udhaarItems.filter(u => u.aging > 30 && u.aging <= 60).reduce((acc, u) => acc + u.dueRaw, 0),
        overdue: udhaarItems.filter(u => u.aging > 60).reduce((acc, u) => acc + u.dueRaw, 0)
    };

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Udhaar Ledger</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor aging receivables and settle outstanding accounts.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select 
                        className="clay-input" 
                        style={{ width: 'auto', minWidth: '180px' }} 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option>All Customers</option>
                        <option>Overdue Only</option>
                    </select>
                    <button className="clay-button primary" onClick={handleExport}><Download size={18} /> Export</button>
                </div>
            </header>

            {/* Record Payment Modal */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    {/* Organic Rounded Blur Backdrop */}
                    <div 
                        style={{ position: 'absolute', inset: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setShowPaymentModal(null)}
                    ></div>

                    <div className="clay-card modal-scale-up" style={{ maxWidth: '480px', width: '100%', padding: '3.5rem', borderRadius: '50px', background: 'white', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.12)' }}>
                        <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowPaymentModal(null)}>
                            <X size={26} color="#2D3436" strokeWidth={2.5} />
                        </button>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <div className="badge-clay" style={{ display: 'inline-flex', marginBottom: '1rem', background: '#e0f2fe', color: '#075985' }}>
                                <ShieldCheck size={14} /> DEBT SETTLEMENT
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#2D3436' }}>Clear Dues</h2>
                        </div>

                        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--warm-bg)', borderRadius: '24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Account</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3436' }}>{showPaymentModal.customer}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '1rem', color: 'var(--danger)' }}>{showPaymentModal.due}</div>
                        </div>

                        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700 }}>Payment Amount (₨)</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '20px' }} />
                                    <input type="number" className="clay-input" required placeholder="Amount to settle" style={{ paddingLeft: '3.5rem' }} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700 }}>Recovery Date</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '20px' }} />
                                    <input type="text" className="clay-input" value={`Settle: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`} readOnly style={{ paddingLeft: '3.5rem', opacity: 0.6 }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700 }}>Staff copybook</label>
                                <select className="clay-input" value={copybookStaff} onChange={(e) => setCopybookStaff(e.target.value)}>
                                    {['STAFF-A', 'STAFF-B', 'STAFF-C', 'STAFF-D', 'STAFF-E'].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="clay-button primary" style={{ width: '100%', height: '70px', marginTop: '1rem', fontSize: '1.3rem', background: 'var(--success)', borderRadius: '24px' }}>Confirm Recovery</button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="clay-card" style={{ borderBottom: '6px solid var(--success)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>0–7 Days</h3>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>₨ {stats.shortTerm.toLocaleString()}</h2>
                </div>
                <div className="clay-card" style={{ borderBottom: '6px solid var(--accent)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>8–30 Days</h3>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>₨ {stats.midTerm.toLocaleString()}</h2>
                </div>
                <div className="clay-card" style={{ borderBottom: '6px solid #f97316', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>31–60 Days</h3>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>₨ {stats.longTerm.toLocaleString()}</h2>
                </div>
                <div className="clay-card" style={{ borderBottom: '6px solid var(--danger)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>60+ Days</h3>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--danger)' }}>₨ {stats.overdue.toLocaleString()}</h2>
                </div>
            </div>

            <div className="clay-card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ padding: '1.4rem 1rem', color: 'var(--text-muted)' }}>Customer Name</th>
                                <th style={{ padding: '1.4rem 1rem', color: 'var(--text-muted)' }}>Invoice Date</th>
                                <th style={{ padding: '1.4rem 1rem', color: 'var(--text-muted)' }}>Outstanding Due</th>
                                <th style={{ padding: '1.4rem 1rem', color: 'var(--text-muted)' }}>Aging Timeline</th>
                                <th style={{ padding: '1.4rem 1rem', textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? filteredItems.map((u, i) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td style={{ padding: '1.8rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--warm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-dark)' }}>{u.customer.charAt(0)}</div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{u.customer}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.8rem 1rem', color: 'var(--text-muted)' }}>{u.date}</td>
                                    <td style={{ padding: '1.8rem 1rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{u.due}</td>
                                    <td style={{ padding: '1.8rem 1rem' }}>
                                        <div className="clay-chip" style={{ background: u.agingColor === 'danger' ? '#fee2e2' : u.agingColor === 'success' ? '#dcfce7' : '#fef3c7', color: u.agingColor === 'danger' ? '#b91c1c' : u.agingColor === 'success' ? '#15803d' : '#b45309', boxShadow: 'none', border: 'none', fontWeight: 700 }}>
                                            <Clock size={14} /> {u.agingText}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.8rem 1rem', textAlign: 'right' }}>
                                        <button 
                                            className="clay-button primary" 
                                            style={{ background: 'var(--primary-dark)', height: '45px', padding: '0 1.2rem', borderRadius: '12px' }}
                                            onClick={() => setShowPaymentModal(u)}
                                        >
                                            <CheckCircle size={16} /> Record Cash
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                                        <Clock size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                        <p style={{ fontSize: '1.1rem' }}>Zero outstanding debts matching this criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Udhaar;
