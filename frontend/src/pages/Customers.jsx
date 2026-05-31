import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, UserPlus, Filter, Download, MoreVertical, CreditCard, X, User, Phone, DollarSign, Calendar, Printer } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copybooks, setCopybooks] = useState([]);
    const [products, setProducts] = useState([]);
    const [beyparis, setBeyparis] = useState([]);
    const [copybookFilter, setCopybookFilter] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(null); // stores the customer object
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyCustomer, setHistoryCustomer] = useState(null);
    const [historyEntries, setHistoryEntries] = useState([]);
    const [historyFrom, setHistoryFrom] = useState('');
    const [historyTo, setHistoryTo] = useState('');
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [newCust, setNewCust] = useState({ name: '', contact: '', product: '', beypariProduct: '', initialPurchase: '', assignedCopybook: 'STAFF-A' });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [businessInfo, setBusinessInfo] = useState({ company: 'Javed & Sons', address: 'Gate No. 4, Fruit Market, Sargodha Road, Faisalabad' });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const [customerRes, staffRes, invRes, beypariRes, settingsRes] = await Promise.all([
                api.get('/data/customers', {
                    params: copybookFilter !== 'ALL' ? { assignedCopybook: copybookFilter } : {},
                }),
                api.get('/data/staff-copybooks'),
                api.get('/data/inventory'),
                api.get('/data/beyparis'),
                api.get('/data/system-settings')
            ]);

            const customerData = customerRes.data || [];
            setCustomers(customerData.map(c => ({ 
                ...c, 
                id: c._id,
                customerId: c.customerId || c._id,
                name: c.name || 'Unknown',
                contact: c.contact || '-',
                product: c.product || '-',
                beypariProduct: c.beypariProduct || '-',
                purchaseRaw: c.purchaseRaw || 0,
                purchase: c.purchase || 'PKR 0',
                udhaarRaw: c.udhaarRaw || 0,
                udhaar: c.udhaar || 'PKR 0',
                udhaarPercent: c.udhaarPercent || 0,
                udhaarType: c.udhaarType || 'success',
                assignedCopybook: c.assignedCopybook || '—',
            })));

            const staffData = staffRes.data || [];
            const inventoryData = invRes.data || [];
            const beypariData = beypariRes.data || [];

            const productNames = [...new Set(inventoryData.filter((item) => item.stock > 0 && item.isSoldInShop !== false).map((item) => item.name).filter(Boolean))];
            const beypariNames = [...new Set(beypariData.map((item) => item.name).filter(Boolean))];

            setCopybooks(staffData);
            setProducts(productNames);
            setBeyparis(beypariNames);
            
            if (settingsRes.data && settingsRes.data.length > 0) {
                const business = settingsRes.data.find(s => s.key === 'business_info');
                if (business && business.value) {
                    setBusinessInfo({
                        company: business.value.company || 'Javed & Sons',
                        address: business.value.address || 'Gate No. 4, Fruit Market, Sargodha Road, Faisalabad'
                    });
                }
            }
            if (!newCust.assignedCopybook && staffData[0]) {
                setNewCust(prev => ({ ...prev, assignedCopybook: staffData[0].staffCode }));
            }
        } catch (err) {
            console.error("Customers fetch fail:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [copybookFilter]);

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        const payload = {
            name: newCust.name || 'Unknown',
            contact: newCust.contact || '-',
            product: newCust.product || '-',
            beypariProduct: newCust.beypariProduct || '-',
            assignedCopybook: newCust.assignedCopybook || '',
            purchaseRaw: 0,
            udhaarRaw: 0,
        };
        try {
            const { data } = await api.post('/data/customers', payload);
            setCustomers((prev) => [...prev, { ...data, id: data._id }]);
            setShowAddModal(false);
            setNewCust({ name: '', contact: '', product: '', beypariProduct: '', initialPurchase: '', assignedCopybook: 'STAFF-A' });
        } catch (err) {
            console.error('Customers post fail:', err);
            alert('Failed to add customer. Please try again.');
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!showPaymentModal) return;
        const amount = parseInt(paymentAmount, 10) || 0;
        const prev = customers;
        try {
            const { data } = await api.post(`/data/customers/${showPaymentModal.id}/payments`, {
                amount,
                copybookStaff: showPaymentModal.assignedCopybook || 'STAFF-A',
                method: 'cash',
            });
            setCustomers((p) => p.map((c) => (c.id === showPaymentModal.id ? { ...c, ...data, id: data._id } : c)));
            setShowPaymentModal(null);
            setPaymentAmount('');
        } catch (err) {
            setCustomers(prev);
            console.error('Customers payment fail:', err);
            alert('Failed to record payment.');
        }
    };

    const buildStatementCsv = (customer, rows) => {
        const header = ['Date', 'Record Type', 'Description', 'Debit', 'Credit', 'Balance', 'Copybook'];
        const lines = [header.join(',')];
        rows.forEach((row) => {
            lines.push([
                new Date(row.date).toISOString().slice(0, 10),
                row.recordType,
                `"${row.description.replace(/"/g, '""')}"`,
                row.debit ? row.debit : '',
                row.credit ? row.credit : '',
                row.balanceAfter !== undefined ? row.balanceAfter : '',
                row.copybook || customer.assignedCopybook || '',
            ].join(','));
        });
        return lines.join('\n');
    };

    const handleExportStatement = () => {
        if (!historyCustomer) return;
        const csv = buildStatementCsv(historyCustomer, historyEntries);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement-${historyCustomer.customerId || historyCustomer.id}-${historyFrom || 'all'}-${historyTo || 'all'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const loadHistoryEntries = async (customer, fromDate, toDate) => {
        setHistoryError('');
        setHistoryLoading(true);
        try {
            const [salesRes, copybookRes] = await Promise.all([
                api.get('/data/shop-sales', {
                    params: {
                        customer: customer.id,
                        from: fromDate || undefined,
                        to: toDate || undefined,
                    },
                }),
                api.get('/data/staff-copybooks/entries', {
                    params: {
                        customer: customer.id,
                        from: fromDate || undefined,
                        to: toDate || undefined,
                    },
                }),
            ]);

            const paymentRows = (customer.payments || [])
                .filter((payment) => {
                    const date = new Date(payment.date);
                    const afterFrom = fromDate ? date >= new Date(fromDate) : true;
                    const beforeTo = toDate ? date <= new Date(toDate) : true;
                    return afterFrom && beforeTo;
                })
                .map((payment, index) => ({
                    id: `payment-${index}`,
                    date: payment.date,
                    recordType: 'Payment',
                    description: `Payment (${payment.method || 'cash'})`, 
                    debit: 0,
                    credit: payment.amount,
                    balanceAfter: '',
                    copybook: payment.copybookStaff || customer.assignedCopybook || '',
                }));

            const saleRows = (salesRes.data || []).map((sale) => ({
                id: sale._id,
                date: sale.saleDate,
                recordType: 'Purchase',
                description: `${sale.productName || 'Sale'} — ${sale.paymentMode} ${sale.totalAmount ? `PKR ${Number(sale.totalAmount).toLocaleString()}` : ''}`,
                debit: sale.udhaarAmount || 0,
                credit: sale.spotAmount || 0,
                balanceAfter: '',
                copybook: sale.copybookStaff || '',
            }));

            const entryRows = (copybookRes.data || []).map((entry) => ({
                id: entry._id,
                date: entry.entryDate,
                recordType: entry.type === 'payment' ? 'Copybook payment' : entry.type === 'sale' ? 'Copybook sale' : 'Copybook entry',
                description: entry.description || entry.customerName || entry.type,
                debit: entry.debit || 0,
                credit: entry.credit || 0,
                balanceAfter: entry.balanceAfter,
                copybook: entry.copybook?.staffCode || customer.assignedCopybook || '',
            }));

            const combined = [...saleRows, ...paymentRows, ...entryRows]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setHistoryEntries(combined);
        } catch (err) {
            console.error('Customer history fail:', err);
            setHistoryEntries([]);
            setHistoryError('Unable to load customer history.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const openHistoryModal = async (customer) => {
        setHistoryCustomer(customer);
        setHistoryFrom('');
        setHistoryTo('');
        setShowHistoryModal(true);
        await loadHistoryEntries(customer, '', '');
    };

    const applyHistoryFilter = () => {
        if (!historyCustomer) return;
        loadHistoryEntries(historyCustomer, historyFrom, historyTo);
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
        const customerId = (c.customerId || c.id || '').toLowerCase();
        const contact = (c.contact || '');
        const query = (searchTerm || '').toLowerCase();
        return name.includes(query) || customerId.includes(query) || contact.includes(searchTerm);
    });

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Customer & Udhaar Ledger</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track buyers and manage credit lines.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                        <Filter size={16} />
                        <select 
                            className="clay-input" 
                            value={copybookFilter}
                            onChange={(e) => setCopybookFilter(e.target.value)}
                        >
                            <option value="ALL">All Copybooks</option>
                            {copybooks.map((book) => (
                                <option key={book._id} value={book.staffCode}>{book.staffName} ({book.staffCode})</option>
                            ))}
                        </select>
                    </label>
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
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Purchased Product</label>
                                {products.length > 0 ? (
                                    <select className="clay-input" value={newCust.product} onChange={(e) => setNewCust({ ...newCust, product: e.target.value })} required>
                                        <option value="">Select product</option>
                                        {products.map((product) => (
                                            <option key={product} value={product}>{product}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="text" className="clay-input" placeholder="Product name or SKU" value={newCust.product} onChange={(e) => setNewCust({...newCust, product: e.target.value})} required />
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Beypari Product</label>
                                {beyparis.length > 0 ? (
                                    <select className="clay-input" value={newCust.beypariProduct} onChange={(e) => setNewCust({ ...newCust, beypariProduct: e.target.value })} required>
                                        <option value="">Select beypari</option>
                                        {beyparis.map((beypari) => (
                                            <option key={beypari} value={beypari}>{beypari}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="text" className="clay-input" placeholder="Beypari supplier / product" value={newCust.beypariProduct} onChange={(e) => setNewCust({...newCust, beypariProduct: e.target.value})} required />
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned copybook (staff)</label>
                                <select className="clay-input" value={newCust.assignedCopybook} onChange={(e) => setNewCust({...newCust, assignedCopybook: e.target.value})}>
                                    {copybooks.length > 0 ? copybooks.map((book) => (
                                        <option key={book._id} value={book.staffCode}>{book.staffName} ({book.staffCode})</option>
                                    )) : ['STAFF-A', 'STAFF-B', 'STAFF-C', 'STAFF-D', 'STAFF-E'].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Record sales and udhaar from Shop Sales page.</p>
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
                                <input type="text" className="clay-input" value={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} readOnly style={{ paddingLeft: '3.5rem', opacity: 0.6 }} />
                            </div>
                            <button type="submit" className="clay-button primary" style={{ width: '100%', height: '60px', marginTop: '1rem', fontSize: '1.1rem' }}>Confirm Payment</button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && historyCustomer && (
                <div className="print-modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ width: '100%', maxWidth: '840px', maxHeight: '90vh', overflow: 'auto', padding: '2rem', position: 'relative' }}>
                        <button className="clay-button no-print" style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', color: 'var(--text-muted)' }} onClick={() => setShowHistoryModal(false)}><X /></button>
                        
                        <div id="printable-invoice" style={{ background: 'white' }}>
                            {/* Printable Letterhead */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                                <h2 style={{ color: 'var(--primary)', fontSize: '2.4rem', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>{businessInfo.company}</h2>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commercial Fruit & Vegetable Commission Merchants</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{businessInfo.address}</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>Customer Statement</h2>
                                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>{historyCustomer.name} — {historyCustomer.customerId}</p>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>Copybook: {historyCustomer.assignedCopybook || 'None'}</p>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>Total Outstanding Udhaar: <strong style={{color: 'var(--danger)'}}>{historyCustomer.udhaar || 'PKR 0'}</strong></p>
                                </div>
                                <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button className="clay-button" onClick={handleExportStatement}><Download size={16} /> Export CSV</button>
                                    <button className="clay-button" onClick={() => window.print()}><Printer size={16} /> Print Statement</button>
                                </div>
                            </div>

                            <div className="no-print" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                                    From
                                    <input type="date" className="clay-input" value={historyFrom} onChange={(e) => setHistoryFrom(e.target.value)} />
                                </label>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                                    To
                                    <input type="date" className="clay-input" value={historyTo} onChange={(e) => setHistoryTo(e.target.value)} />
                                </label>
                                <button type="button" className="clay-button primary" style={{ height: '44px', alignSelf: 'flex-end' }} onClick={applyHistoryFilter}>Apply Dates</button>
                            </div>
                            
                            {historyError && (
                                <div className="clay-card no-print" style={{ marginBottom: '1rem', padding: '1rem', color: 'var(--danger)' }}>{historyError}</div>
                            )}

                            <div style={{ overflowX: 'auto' }}>
                                {historyLoading ? (
                                    <div className="no-print" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                                <th style={{ padding: '1rem', textAlign: 'left', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Date</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Type</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Description</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Debit</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Credit</th>
                                                <th style={{ padding: '1rem', textAlign: 'right', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Balance</th>
                                                <th style={{ padding: '1rem', textAlign: 'left', color: '#334155' }}>Copybook</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyEntries.length > 0 ? historyEntries.map((entry) => (
                                                <tr key={entry.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '0.8rem 1rem', borderRight: '1px solid #e2e8f0' }}>{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                                                    <td style={{ padding: '0.8rem 1rem', borderRight: '1px solid #e2e8f0' }}>{entry.recordType}</td>
                                                    <td style={{ padding: '0.8rem 1rem', borderRight: '1px solid #e2e8f0' }}>{entry.description}</td>
                                                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>{entry.debit ? `PKR ${Number(entry.debit).toLocaleString()}` : '-'}</td>
                                                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>{entry.credit ? `PKR ${Number(entry.credit).toLocaleString()}` : '-'}</td>
                                                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', borderRight: '1px solid #e2e8f0', fontWeight: 'bold' }}>{entry.balanceAfter !== undefined ? `PKR ${Number(entry.balanceAfter).toLocaleString()}` : '-'}</td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>{entry.copybook || '-'}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No history found for this customer in the selected date range.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
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
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Product</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Beypari Product</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Copybook</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Total Purchase</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Current Udhaar</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--warm-bg)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            <p>Accessing credit records from server...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCustomers.length > 0 ? filteredCustomers.map((c, i) => (
                                <tr key={c.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                                    <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold' }}>{c.customerId || c.id || '-'}</td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{c.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.contact || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem' }}>{c.product || '-'}</td>
                                    <td style={{ padding: '1.5rem 1rem' }}>{c.beypariProduct || '-'}</td>
                                    <td style={{ padding: '1.5rem 1rem' }}>{c.assignedCopybook || '-'}</td>
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
                                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            <button className="clay-button" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} onClick={() => openHistoryModal(c)}><Download size={16} /> History</button>
                                            <button className="clay-button primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setShowPaymentModal(c)}><CreditCard size={16} /> Record Cash</button>
                                            <button className="clay-button" style={{ padding: '0.6rem', borderRadius: '12px', background: '#fff1f1', color: '#f87171', border: 'none' }} onClick={() => handleDeleteCustomer(c.id)} title="Delete Customer">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
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
