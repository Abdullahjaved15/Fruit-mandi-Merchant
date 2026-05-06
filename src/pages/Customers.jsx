import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, UserPlus, Filter, Download, MoreVertical, CreditCard, X, User, Phone, DollarSign, Calendar } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);

    // Silently load from DB in background
    useEffect(() => {
        api.get('/data/customers')
            .then(({ data }) => { 
                if (data && data.length > 0) {
                    setCustomers(data.map(c => ({ 
                        ...c, 
                        id: c._id, // Use for API calls
                        customerId: c.customerId || c._id, // For display
                        name: c.name || 'Unknown',
                        contact: c.contact || '-',
                        purchaseRaw: c.purchaseRaw || 0,
                        purchase: c.purchase || 'PKR 0',
                        udhaarRaw: c.udhaarRaw || 0,
                        udhaar: c.udhaar || 'PKR 0',
                        udhaarPercent: c.udhaarPercent || 0,
                        udhaarType: c.udhaarType || 'success'
                    }))); 
                }
            })
            .catch((err) => console.error("Customers fetch fail:", err));
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(null); // stores the customer object
    const [newCust, setNewCust] = useState({ name: '', contact: '', initialPurchase: '' });
    const [paymentAmount, setPaymentAmount] = useState('');

    const handleAddCustomer = (e) => {
        e.preventDefault();
        const id = `CUST-00${customers.length + 1}`;
        const purchaseRaw = parseInt(newCust.initialPurchase) || 0;
        const newEntry = {
            id, customerId: id,
            name: newCust.name || 'Unknown',
            contact: newCust.contact || '-',
            purchaseRaw,
            purchase: `PKR ${purchaseRaw.toLocaleString()}`,
            udhaarRaw: purchaseRaw,
            udhaar: `PKR ${purchaseRaw.toLocaleString()}`,
            udhaarPercent: purchaseRaw > 0 ? 100 : 0,
            udhaarType: purchaseRaw > 500000 ? 'danger' : (purchaseRaw > 0 ? 'accent' : 'success')
        };
        // Update UI instantly
        setCustomers(prev => [...prev, newEntry]);
        setShowAddModal(false);
        setNewCust({ name: '', contact: '', initialPurchase: '' });
        // Save to DB silently
        api.post('/data/customers', newEntry).catch((err) => console.error("Customers post fail:", err));
    };

    const handleRecordPayment = (e) => {
        e.preventDefault();
        if (!showPaymentModal) return;
        const amount = parseInt(paymentAmount) || 0;
        const currentUdhaarRaw = showPaymentModal.udhaarRaw || 0;
        const currentPurchaseRaw = showPaymentModal.purchaseRaw || 0;
        
        const newUdhaarRaw = Math.max(0, currentUdhaarRaw - amount);
        const newPercent = currentPurchaseRaw > 0 ? (newUdhaarRaw / currentPurchaseRaw) * 100 : 0;
        const updateData = {
            udhaarRaw: newUdhaarRaw,
            udhaar: `PKR ${newUdhaarRaw.toLocaleString()}`,
            udhaarPercent: newPercent,
            udhaarType: newPercent > 70 ? 'danger' : (newPercent > 0 ? 'accent' : 'success')
        };
        // Update UI instantly
        setCustomers(prev => prev.map(c => c.id === showPaymentModal.id ? { ...c, ...updateData } : c));
        setShowPaymentModal(null);
        setPaymentAmount('');
        alert(`Payment of PKR ${amount.toLocaleString()} recorded for ${showPaymentModal.name}`);
        // Save to DB silently
        api.put(`/data/customers/${showPaymentModal.id}/payment`, updateData).catch((err) => console.error("Customers payment fail:", err));
    };

    const handleDeleteCustomer = (id) => {
        if (window.confirm("Are you sure you want to remove this customer and all their data?")) {
            setCustomers(prev => prev.filter(c => c.id !== id));
            api.delete(`/data/customers/${id}`)
                .then(() => console.log("Customer removed from DB"))
                .catch((err) => {
                    console.error("Delete fail:", err);
                    alert("Sync failed: Database could not remove customer.");
                });
        }
    };

    const filteredCustomers = customers.filter(c => {
        const name = (c.name || '').toLowerCase();
        const id = (c.id || c.customerId || '').toLowerCase();
        const contact = (c.contact || '');
        const query = (searchTerm || '').toLowerCase();
        return name.includes(query) || id.includes(query) || contact.includes(searchTerm);
    });

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Customer & Udhaar Ledger</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track buyers and manage credit lines.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
                        <input 
                            type="text" 
                            className="clay-input" 
                            placeholder="Search customers..." 
                            style={{ paddingLeft: '3rem' }} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="clay-button primary" onClick={() => setShowAddModal(true)}><UserPlus /> New Customer</button>
                </div>
            </header>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', borderRadius: '45px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Register Customer</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', border: 'none', color: 'var(--danger)', background: 'rgba(255,0,0,0.05)', padding: 0 }} onClick={() => setShowAddModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ position: 'relative' }}>
                                <User style={{ position: 'absolute', left: '1.2rem', top: '1.1rem', color: 'var(--text-muted)', width: '18px' }} />
                                <input type="text" className="clay-input" required placeholder="Full Name" style={{ paddingLeft: '3.5rem' }} value={newCust.name} onChange={(e) => setNewCust({...newCust, name: e.target.value})} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Phone style={{ position: 'absolute', left: '1.2rem', top: '1.1rem', color: 'var(--text-muted)', width: '18px' }} />
                                <input type="text" className="clay-input" required placeholder="Contact Number" style={{ paddingLeft: '3.5rem' }} value={newCust.contact} onChange={(e) => setNewCust({...newCust, contact: e.target.value})} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <DollarSign style={{ position: 'absolute', left: '1.2rem', top: '1.1rem', color: 'var(--text-muted)', width: '18px' }} />
                                <input type="number" className="clay-input" required placeholder="Initial Purchase Bill (PKR)" style={{ paddingLeft: '3.5rem' }} value={newCust.initialPurchase} onChange={(e) => setNewCust({...newCust, initialPurchase: e.target.value})} />
                            </div>
                            <button type="submit" className="clay-button primary" style={{ width: '100%', height: '60px', marginTop: '1rem', fontSize: '1.1rem' }}>Create Account</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Payment Modal */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', borderRadius: '45px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Record Payment</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', border: 'none', color: 'var(--danger)', background: 'rgba(255,0,0,0.05)', padding: 0 }} onClick={() => setShowPaymentModal(null)}><X /></button>
                        </div>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>CUSTOMER: <b>{showPaymentModal.name || 'Unknown'}</b></div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem' }}>Current Balance: {showPaymentModal.udhaar || 'PKR 0'}</div>
                        </div>
                        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ position: 'relative' }}>
                                <DollarSign style={{ position: 'absolute', left: '1.2rem', top: '1.1rem', color: 'var(--text-muted)', width: '18px' }} />
                                <input type="number" className="clay-input" required placeholder="Enter Payment Amount (PKR)" style={{ paddingLeft: '3.5rem' }} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Calendar style={{ position: 'absolute', left: '1.2rem', top: '1.1rem', color: 'var(--text-muted)', width: '18px' }} />
                                <input type="text" className="clay-input" value="Today, 31 Mar 2026" readOnly style={{ paddingLeft: '3.5rem', opacity: 0.6 }} />
                            </div>
                            <button type="submit" className="clay-button primary" style={{ width: '100%', height: '60px', marginTop: '1rem', fontSize: '1.1rem' }}>Confirm Payment</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="clay-card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Customer ID</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name & Contact</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Total Purchase</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Current Udhaar</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? filteredCustomers.map((c, i) => (
                                <tr key={c.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                                    <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold' }}>{c.id || '-'}</td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{c.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.contact || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem' }}>{c.purchase || 'PKR 0'}</td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <span style={{ color: `var(--${c.udhaarType || 'success'})`, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {c.udhaar || 'PKR 0'}
                                            <div style={{ width: '60px', height: '8px', background: 'var(--warm-bg)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'var(--clay-shadow-in)' }}>
                                                <div style={{ width: `${c.udhaarPercent || 0}%`, height: '100%', background: `var(--${c.udhaarType || 'success'})`, borderRadius: '4px' }}></div>
                                            </div>
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                                            <button className="clay-button primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setShowPaymentModal(c)}><CreditCard size={16} /> Record Cash</button>
                                            <button className="clay-button" style={{ padding: '0.6rem', borderRadius: '12px', background: '#fff1f1', color: '#f87171', border: 'none' }} onClick={() => handleDeleteCustomer(c.id)} title="Delete Customer">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        <Search style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.2 }} />
                                        <p>No customers found matching "{searchTerm}"</p>
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

export default Customers;
