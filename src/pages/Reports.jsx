import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileCheck, Printer, Download, Eye, X, Landmark, User, FileText, CheckCircle2, TrendingUp, DollarSign, PieChart, BarChart3, Receipt } from 'lucide-react';

const Reports = () => {
    const [invoiceType, setInvoiceType] = useState('Beypari Settlement');
    const [entityName, setEntityName] = useState('');
    const [amount, setAmount] = useState('');
    const [isGenerated, setIsGenerated] = useState(false);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    const [invoiceNumber, setInvoiceNumber] = useState('INV-77488');

    // Recent History State
    const [history, setHistory] = useState([]);

    // Silently load real data from DB in background
    useEffect(() => {
        api.get('/data/reports')
            .then(({ data }) => { 
                if (data && data.length > 0) {
                    setHistory(data.map(h => ({ 
                        ...h, 
                        id: h._id, // Use for API calls
                        invoiceId: h.invoiceId || h._id, // For display
                        entity: h.entity || 'Unknown',
                        type: h.type || 'Settlement',
                        date: h.date || '-',
                        amount: parseFloat(h.amount) || 0
                    }))); 
                }
            })
            .catch((err) => console.error("Reports fetch fail:", err));
    }, []);

    const handleGenerate = () => {
        if (!entityName || !amount) {
            alert("Please provide both Entity Name and Amount.");
            return;
        }
        setIsGenerated(true);
        const newNo = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
        setInvoiceNumber(newNo);
        
        const newEntry = { 
            invoiceId: newNo,
            id: newNo, 
            entity: entityName, 
            type: invoiceType.split(' ')[0], 
            date: invoiceDate, 
            amount: parseFloat(amount) 
        };
        // Add to history
        setHistory([newEntry, ...history]);
        // Save to DB silently
        api.post('/data/reports', newEntry).catch((err) => console.error("Reports save fail:", err));
    };

    const handleDeleteInvoice = (id) => {
        if (window.confirm("Are you sure you want to delete this invoice record from history?")) {
            setHistory(prev => prev.filter(h => h.id !== id));
            api.delete(`/data/reports/${id}`)
                .then(() => console.log("Invoice deleted from DB"))
                .catch((err) => {
                    console.error("Delete fail:", err);
                    alert("Database sync failed.");
                });
        }
    };

    const loadFromHistory = (item) => {
        setEntityName(item.entity);
        setAmount(item.amount.toString());
        setInvoiceType(item.type === 'Settlement' ? 'Beypari Settlement' : 'Customer Statement');
        setInvoiceNumber(item.id);
        setInvoiceDate(item.date);
        setIsGenerated(true);
        // Scroll to preview
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrint = () => {
        if (!isGenerated) return;
        const printContent = document.getElementById('printable-invoice');
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    // Derived calculations
    const amt = parseFloat(amount) || 0;
    const commRate = 0.08; 
    const commission = amt * commRate;
    const tax = (amt - commission) * 0.02; 
    const netTotal = amt - commission - tax;

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Invoices & Reports</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Generate Beypari settlements and analytical reports.</p>
                </div>
            </header>

            {/* Summary Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><TrendingUp size={24} /></div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>MONTHLY VOLUME</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>PKR 0</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No data for current month</div>
                </div>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><PieChart size={24} /></div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>COMMISSION EARNED</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>PKR 0</h2>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>Avg. 0% across all entity</div>
                </div>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#fee2e2', color: '#991b1b' }}><BarChart3 size={24} /></div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>TAX LIABILITY</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>PKR 0</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No pending tax payments</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', marginBottom: '3rem' }}>
                {/* Generator Form */}
                <div className="clay-card" style={{ height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)' }}><FileCheck size={20} /></div>
                        <h3 style={{ margin: 0 }}>Invoice Generator</h3>
                    </div>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Report Type</label>
                            <select 
                                className="clay-input" 
                                value={invoiceType} 
                                onChange={(e) => setInvoiceType(e.target.value)}
                                style={{ appearance: 'none' }}
                            >
                                <option>Beypari Settlement</option>
                                <option>Customer Statement</option>
                                <option>Daily Summary</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Entity Name</label>
                            <div style={{ position: 'relative' }}>
                                <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px' }} />
                                <input 
                                    type="text" 
                                    className="clay-input" 
                                    placeholder="e.g. Nawaz Farms" 
                                    style={{ paddingLeft: '2.8rem' }}
                                    value={entityName}
                                    onChange={(e) => setEntityName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Gross Amount (PKR)</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '16px' }} />
                                <input 
                                    type="number" 
                                    className="clay-input" 
                                    placeholder="Enter total gross amount" 
                                    style={{ paddingLeft: '2.8rem' }}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="button" className="clay-button primary" style={{ marginTop: '1rem', height: '55px', borderRadius: '18px' }} onClick={handleGenerate}><FileCheck /> Generate Final Invoice</button>
                    </form>
                </div>

                {/* Preview Panel */}
                <div className="clay-card" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '32px' }}>
                    <div id="printable-invoice" className="clay-card" style={{ background: 'white', padding: '3.5rem', borderRadius: '24px', minHeight: '600px', display: 'flex', flexDirection: 'column', color: '#1e293b' }}>
                        {/* Letterhead */}
                        <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '2rem' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '2.4rem', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Javed & Sons</h2>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commercial Fruit & Vegetable Commission Merchants</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>Gate No. 4, Fruit Market, Sargodha Road, Faisalabad</p>
                        </div>

                        {isGenerated ? (
                            <div style={{ flex: 1, animation: 'fadeIn 0.5s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 700 }}>BILL TO:</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{entityName}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Region: North Zone / Faisalabad</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 700 }}>INVOICE DETAILS:</div>
                                        <div><b>Number:</b> {invoiceNumber}</div>
                                        <div><b>Date:</b> {invoiceDate}</div>
                                        <div><b>Type:</b> {invoiceType}</div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>DESCRIPTION</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem' }}>GROSS</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem' }}>RATE</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem' }}>LINE TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>Total Consignments Sales (Gross)</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>{amt.toLocaleString()}</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>1.0x</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>PKR {amt.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>Commission (Agent Fee)</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>-</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>8%</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9', color: 'var(--danger)' }}>- {commission.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>Withholding Tax (FBR 2%)</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>-</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>2%</td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9', color: 'var(--danger)' }}>- {tax.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ width: '250px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#64748b' }}>
                                            <span>Subtotal</span>
                                            <span>PKR {amt.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--danger)' }}>
                                            <span>Abatement</span>
                                            <span>- {(commission + tax).toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '2px solid #e2e8f0', marginTop: '0.5rem', fontSize: '1.4rem', fontWeight: 800 }}>
                                            <span>Net Total</span>
                                            <span>PKR {netTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '300px' }}>
                                        * This is a computer-generated document and does not require a physical signature. Verified by Digitized Register.
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '150px', borderBottom: '1px solid #1e293b' }}></div>
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 700 }}>AUTHORIZED SEAL</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                <FileText size={80} style={{ marginBottom: '1.5rem' }} />
                                <p style={{ textAlign: 'center', maxWidth: '300px' }}>Fill in the generator details and click generate to view the itemized breakdown here.</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #f8fafc' }}>
                            <button className="clay-button" style={{ height: '50px', padding: '0 1.5rem' }} onClick={handlePrint} disabled={!isGenerated}><Printer size={18} /> Print Invoice</button>
                            <button className="clay-button primary" style={{ height: '50px', padding: '0 2rem' }} onClick={handlePrint} disabled={!isGenerated}><Download size={18} /> Save as PDF</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="clay-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--warm-bg)', borderRadius: '12px' }}><Receipt size={20} /></div>
                    <h3 style={{ margin: 0 }}>Recent Invoice Logs</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Invoice ID</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Entity Entity</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Type</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Gross Amount</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                                    <td style={{ padding: '1.2rem 1rem', fontWeight: 700 }}>{h.id}</td>
                                    <td style={{ padding: '1.2rem 1rem', fontWeight: 600 }}>{h.entity}</td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <span className="clay-chip">{h.type}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>{h.date}</td>
                                    <td style={{ padding: '1.2rem 1rem', fontWeight: 600 }}>PKR {h.amount.toLocaleString()}</td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                                            <button className="clay-button" style={{ padding: '0.5rem 1rem' }} onClick={() => loadFromHistory(h)}><Eye size={16} /> View</button>
                                            <button className="clay-button" style={{ padding: '0.5rem', borderRadius: '10px', background: '#fff1f1', color: '#f87171', border: 'none' }} onClick={() => handleDeleteInvoice(h.id)} title="Delete Log">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;


