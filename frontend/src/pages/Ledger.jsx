import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Filter, Download, MoreVertical, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

const Ledger = () => {
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [entryType, setEntryType] = useState('income');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showReceiptId, setShowReceiptId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const [transactions, setTransactions] = useState([]);
    const [newTx, setNewTx] = useState({ party: '', amountRaw: '', desc: '' });

    // Silently load real data from DB in background
    useEffect(() => {
        api.get('/data/ledger')
            .then(({ data }) => { 
                if (data && data.length > 0) {
                    setTransactions(data.map(t => ({ 
                        ...t, 
                        id: t._id, // Use for API calls
                        transactionId: t.transactionId || t._id, // For display
                        date: t.date || 'Today, Just Now',
                        desc: t.desc || 'No description',
                        party: t.party || 'Unknown',
                        amountRaw: parseInt(t.amountRaw) || 0,
                        amount: t.amount || `₨ ${(parseInt(t.amountRaw) || 0).toLocaleString()}`,
                        type: t.type || 'income'
                    }))); 
                }
            })
            .catch((err) => console.error("Ledger fetch fail:", err));
    }, []);

    const handleExportExcel = () => {
        const data = filteredTransactions.map(t => ({
            Date: t.date,
            ID: t.transactionId,
            Description: t.desc,
            Party: t.party,
            Type: t.type,
            Amount: t.amountRaw
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
        XLSX.writeFile(workbook, `Ledger_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        setOpenMenuId(null);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Javed & Sons - Daily Ledger Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
        
        const tableColumn = ["Date", "ID", "Description", "Party", "Type", "Amount"];
        const tableRows = filteredTransactions.map(t => [
            t.date, t.transactionId, t.desc, t.party, t.type.toUpperCase(), `RS ${t.amountRaw.toLocaleString()}`
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] }
        });
        
        doc.save(`Ledger_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        setOpenMenuId(null);
    };

    const deleteTransaction = (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            // Update UI instantly
            setTransactions(prev => prev.filter(t => t.id !== id));
            setOpenMenuId(null);
            // Delete from DB
            api.delete(`/data/ledger/${id}`)
                .then(() => console.log("Transaction deleted from DB"))
                .catch((err) => {
                    console.error("Ledger delete fail:", err);
                    alert("Failed to delete from database. Please check your connection.");
                });
        }
    };

    const handleAddTransaction = () => {
        if (!newTx.party || !newTx.amountRaw || !newTx.desc) {
            alert('Please fill all fields');
            return;
        }
        const id = `TX-${9000 + transactions.length + 1}`;
        const amountRaw = parseInt(newTx.amountRaw) || 0;
        const newEntry = {
            transactionId: id, id,
            date: "Today, Just Now",
            desc: newTx.desc || 'No description',
            party: newTx.party || 'Unknown',
            amountRaw,
            amount: `${entryType === 'income' ? '+' : '-'}₨ ${amountRaw.toLocaleString()}`,
            type: entryType || 'income'
        };
        // Update UI instantly
        setTransactions(prev => [newEntry, ...prev]);
        setShowNewEntry(false);
        setNewTx({ party: '', amountRaw: '', desc: '' });
        alert('Entry added to ledger!');
        // Save to DB silently
        api.post('/data/ledger', newEntry).catch((err) => console.error("Ledger post fail:", err));
    };

    const filteredTransactions = transactions.filter(t => {
        const desc = (t.desc || '').toLowerCase();
        const party = (t.party || '').toLowerCase();
        const id = (String(t.id || t.transactionId || '')).toLowerCase();
        const query = (searchQuery || '').toLowerCase();
        const matchesSearch = desc.includes(query) || party.includes(query) || id.includes(query);
        if (activeFilter === 'All') return matchesSearch;
        return matchesSearch && (t.type || '').toLowerCase() === activeFilter.toLowerCase();
    });

    return (
        <div onClick={() => setOpenMenuId(null)}>
            {/* New Entry Modal */}
            {showNewEntry && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', borderRadius: '45px', animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', background: 'white' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Record {entryType === 'income' ? 'Income' : 'Expense'}</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', borderRadius: '12px', color: 'var(--danger)', boxShadow: 'none', background: 'rgba(255,0,0,0.05)' }} onClick={() => setShowNewEntry(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Transaction Type</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button 
                                        className={`clay-button ${entryType === 'income' ? 'primary' : ''}`} 
                                        style={{ flex: 1, height: '45px', borderRadius: '14px', justifyContent: 'center' }}
                                        onClick={() => setEntryType('income')}
                                    >Income</button>
                                    <button 
                                        className={`clay-button ${entryType === 'expense' ? 'primary' : ''}`} 
                                        style={{ flex: 1, height: '45px', borderRadius: '14px', justifyContent: 'center' }}
                                        onClick={() => setEntryType('expense')}
                                    >Expense</button>
                                </div>
                            </div>
                            <input type="text" className="clay-input" placeholder="Select Party / Person" style={{ height: '52px', borderRadius: '18px' }} value={newTx.party} onChange={e => setNewTx({...newTx, party: e.target.value})} />
                            <input type="number" className="clay-input" placeholder="Amount (₨)" style={{ height: '52px', borderRadius: '18px' }} value={newTx.amountRaw} onChange={e => setNewTx({...newTx, amountRaw: e.target.value})} />
                            <textarea className="clay-input" placeholder="Description..." style={{ minHeight: '100px', paddingTop: '1rem', borderRadius: '22px' }} value={newTx.desc} onChange={e => setNewTx({...newTx, desc: e.target.value})}></textarea>
                            <button className="clay-button primary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', height: '60px', borderRadius: '22px', fontSize: '1.1rem', fontWeight: 700 }} onClick={handleAddTransaction}>Record Transaction</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(15px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '400px', width: '100%', padding: '3rem', borderRadius: '20px', border: '1px dashed #ccc', background: 'white', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowReceiptId(null)}>✕</button>
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #eee', marginBottom: '2rem', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Javed 🌿 Sons</h2>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Sargodha Mandi, Pakistan</p>
                            <h3 style={{ marginTop: '1rem', letterSpacing: '2px' }}>RECEIPT</h3>
                        </div>
                        {transactions.find(t => t.id === showReceiptId) && (() => {
                            const t = transactions.find(t => t.id === showReceiptId);
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Receipt ID:</span> <b>{t.id}</b></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Date:</span> <b>{new Date().toLocaleDateString('en-GB')}</b></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ opacity: 0.6 }}>Party:</span> <b>{t.party}</b></div>
                                    <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '1rem' }}><span>TOTAL COST:</span> <b>{t.amount}</b></div>
                                    <button className="clay-button primary" style={{ marginTop: '2rem', justifyContent: 'center' }} onClick={() => window.print()}>Print Receipt</button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Generating Report Overlay */}
            {isGenerating && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(15px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '6px solid var(--primary-light)', borderTop: '6px solid var(--primary)', animation: 'spin 1s linear infinite', boxShadow: '0 0 30px rgba(0,0,0,0.05)' }}></div>
                    <h2 style={{ margin: 0, fontWeight: 800, color: 'var(--primary-dark)' }}>Generating Daily Report...</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Please wait while we prepare your data.</p>
                </div>
            )}

            <div className="page-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Daily Ledger</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Real-time record of all cash and credit transactions.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="clay-button primary" onClick={() => setShowNewEntry(true)}><Plus /> New Entry</button>
                        <div style={{ position: 'relative' }}>
                            <button className="clay-button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === 'export_ledger' ? null : 'export_ledger'); }}>
                                <Download style={{ width: '18px' }} /> Report <MoreVertical size={14} />
                            </button>
                            {openMenuId === 'export_ledger' && (
                                <div className="clay-card" style={{ position: 'absolute', right: 0, top: '55px', zIndex: 1000, width: '150px', padding: '0.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    <button className="menu-item" style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '12px' }} onClick={handleExportExcel}>Excel (.xlsx)</button>
                                    <button className="menu-item" style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '12px' }} onClick={handleExportPDF}>PDF (.pdf)</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="clay-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><ArrowUpRight style={{ width: '24px' }} /></div>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Total Income</span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem' }}>₨ {transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (parseInt(t.amountRaw) || 0), 0).toLocaleString()}</h2>
                    </div>
                    <div className="clay-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon" style={{ background: '#fee2e2', color: '#991b1b' }}><ArrowDownLeft style={{ width: '24px' }} /></div>
                            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Total Expense</span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem' }}>₨ {transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (parseInt(t.amountRaw) || 0), 0).toLocaleString()}</h2>
                    </div>
                    <div className="clay-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#075985' }}><FileText style={{ width: '24px' }} /></div>
                            <span style={{ color: '#0369a1', fontWeight: 'bold' }}>Net Balance</span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem' }}>₨ {(transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (parseInt(t.amountRaw) || 0), 0) - transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (parseInt(t.amountRaw) || 0), 0)).toLocaleString()}</h2>
                    </div>
                </div>

                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '350px' }}>
                            <Search style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
                            <input 
                                type="text" 
                                className="clay-input" 
                                placeholder="Search by name, party, or ID..." 
                                style={{ paddingLeft: '3.5rem', height: '50px', borderRadius: '15px' }} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className={`clay-button ${activeFilter !== 'All' ? 'primary' : ''}`} style={{ borderRadius: '12px' }} onClick={() => {
                                const filters = ['All', 'Income', 'Expense'];
                                const next = filters[(filters.indexOf(activeFilter) + 1) % filters.length];
                                setActiveFilter(next);
                            }}>
                                <Filter /> {activeFilter} Only
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date & ID</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Description</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Party</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((t, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', position: 'relative' }}>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.date}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{t.id}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', fontWeight: 600 }}>{t.desc}</td>
                                        <td style={{ padding: '1.2rem 1rem' }}>{t.party}</td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <span style={{
                                                color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem'
                                            }}>
                                                {t.amount}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', textAlign: 'right', position: 'relative' }}>
                                            <button 
                                                className="clay-button" 
                                                style={{ padding: '0.5rem', borderRadius: '10px' }}
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id); }}
                                            >
                                                <MoreVertical style={{ width: '18px' }} />
                                            </button>

                                            {openMenuId === t.id && (
                                                <div className="clay-card" style={{ position: 'absolute', right: '4rem', top: '10%', zIndex: 100, padding: '0.5rem', minWidth: '150px', animation: 'scaleUp 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
                                                    <button className="nav-link" style={{ width: '100%', color: 'var(--text-main)', padding: '0.5rem 1rem', background: 'none' }} onClick={() => { setShowNewEntry(true); setOpenMenuId(null); }}>Edit Entry</button>
                                                    <button className="nav-link" style={{ width: '100%', color: 'var(--text-main)', padding: '0.5rem 1rem', background: 'none' }} onClick={() => { setShowReceiptId(t.id); setOpenMenuId(null); }}>View Receipt</button>
                                                    <button className="nav-link" style={{ width: '100%', color: 'var(--danger)', padding: '0.5rem 1rem', background: 'none' }} onClick={() => deleteTransaction(t.id)}>Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTransactions.length === 0 && (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <FileText style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No {activeFilter === 'All' ? '' : activeFilter} transactions found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ledger;
