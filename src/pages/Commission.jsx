import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, Percent, TrendingUp, BarChart3, Clock, X, FileText, Calendar, DollarSign, PieChart } from 'lucide-react';

const Commission = () => {
    const [settlements, setSettlements] = useState([
        { date: "Today, 09:30 AM", name: "Nawaz Farms", sale: 145000, rate: 6.5 },
        { date: "Yesterday", name: "Chaudhary Orchards", sale: 85500, rate: 7.0 },
        { date: "12-Aug-2026", name: "Haji Gulzar Group", sale: 220000, rate: 6.0 },
        { date: "10-Aug-2026", name: "Kashmir Saib Co.", sale: 350000, rate: 8.0 },
        { date: "05-Aug-2026", name: "Sindh Mango Farm", sale: 115000, rate: 6.5 }
    ]);

    const [showMonthlyReport, setShowMonthlyReport] = useState(false);
    const [selectedMonthData, setSelectedMonthData] = useState(null);

    const graphData = [
        { label: 'May', height: '30%', color: '#3b82f6', exactAmount: 145000, crates: 2800 },
        { label: 'Jun', height: '55%', color: '#10b981', exactAmount: 265000, crates: 4200 },
        { label: 'Jul', height: '45%', color: '#6366f1', exactAmount: 195000, crates: 3500 },
        { label: 'Aug', height: '85%', color: '#f59e0b', exactAmount: 410000, crates: 6800 }
    ];

    const handleExportCSV = () => {
        const headers = ["Date", "Beypari Name", "Sale Amount", "Commission Rate (%)", "Earned (PKR)"];
        const csvContent = [
            headers.join(","),
            ...settlements.map(s => `"${s.date}","${s.name}",${s.sale},${s.rate},${(s.sale * (s.rate/100)).toFixed(2)}`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Commission_Ledger_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("CSV Export Completed successfully.");
    };

    const calculateEarned = (sale, rate) => {
        return Math.round(sale * (rate / 100));
    };

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Commission Analytics</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track earnings from Beypari sales and marketplace fees.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="clay-button primary" onClick={() => setShowMonthlyReport(true)}><FileText size={18} /> Monthly Report</button>
                    <button className="clay-button" onClick={handleExportCSV}><Download size={18} /> Export CSV</button>
                </div>
            </header>

            {/* Monthly Report Modal */}
            {showMonthlyReport && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div 
                        style={{ position: 'absolute', inset: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setShowMonthlyReport(false)}
                    ></div>
                    <div className="clay-card modal-scale-up" style={{ width: '100%', maxWidth: '600px', padding: '3.5rem', position: 'relative', background: 'white', borderRadius: '50px', boxShadow: '0 50px 100px rgba(0,0,0,0.12)' }}>
                        <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowMonthlyReport(false)}>
                            <X size={26} color="#2D3436" strokeWidth={2.5} />
                        </button>
                        <h2 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><Calendar color="var(--primary)" /> August 2026 Summary</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="clay-card" style={{ background: 'var(--warm-bg)', boxShadow: 'none' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Gross Sales</div>
                                <h3 style={{ fontSize: '1.8rem' }}>₨ {settlements.reduce((acc, s) => acc + s.sale, 0).toLocaleString()}</h3>
                            </div>
                            <div className="clay-card" style={{ background: '#f0fdf4', border: 'none', boxShadow: 'none' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Net Commission Earned</div>
                                <h3 style={{ fontSize: '1.8rem', color: '#166534' }}>₨ {settlements.reduce((acc, s) => acc + calculateEarned(s.sale, s.rate), 0).toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="clay-card" style={{ background: 'var(--warm-bg)', boxShadow: 'none', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Average Comm. Rate</span>
                                <span style={{ fontWeight: 800 }}>{(settlements.reduce((acc,s) => acc + s.rate, 0) / settlements.length).toFixed(1)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Active Beyparis</span>
                                <span style={{ fontWeight: 800 }}>{settlements.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Mandi Tax (Status)</span>
                                <span style={{ fontWeight: 800, color: 'var(--danger)' }}>PENDING</span>
                            </div>
                        </div>

                        <button className="clay-button primary" style={{ width: '100%', height: '60px', borderRadius: '20px' }} onClick={() => { alert('Downloading standard PDF report...'); setShowMonthlyReport(false); }}>Download Official Report</button>
                    </div>
                </div>
            )}

            {/* Graph Data View Modal */}
            {selectedMonthData && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div 
                        style={{ position: 'absolute', inset: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setSelectedMonthData(null)}
                    ></div>
                    <div className="clay-card modal-scale-up" style={{ width: '100%', maxWidth: '400px', padding: '3.5rem', position: 'relative', background: 'white', borderRadius: '40px', boxShadow: '0 50px 100px rgba(0,0,0,0.12)', textAlign: 'center' }}>
                        <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedMonthData(null)}>
                            <X size={24} color="#2D3436" strokeWidth={2.5} />
                        </button>
                        
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: selectedMonthData.color, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <TrendingUp size={36} />
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedMonthData.label} 2026 Analysis</div>
                        <h2 style={{ fontSize: '2.4rem', color: '#2D3436', marginBottom: '2rem' }}>₨ {selectedMonthData.exactAmount.toLocaleString()}</h2>

                        <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--warm-bg)', borderRadius: '15px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Crates Handled</span>
                                <span style={{ fontWeight: 800 }}>{selectedMonthData.crates.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--warm-bg)', borderRadius: '15px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Performance</span>
                                <span style={{ fontWeight: 800, color: 'var(--success)' }}>Exceeds Target</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="clay-card">
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><BarChart3 color="var(--primary)" /> Commission Growth Trend</h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '2.5rem', padding: '2rem 1rem 1rem 1rem' }}>
                        {graphData.map((d, i) => (
                            <div 
                                key={i} 
                                style={{ flex: 1, height: d.height, background: d.color, borderRadius: '15px 15px 0 0', position: 'relative', boxShadow: 'var(--clay-shadow)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                onClick={() => setSelectedMonthData(d)}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
                                title={`Click to view details for ${d.label}`}
                            >
                                <span style={{ position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.9rem', fontWeight: 700, color: '#4a4a4a' }}>{d.label}</span>
                                <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 800, opacity: 0.8 }}>₨ {(d.exactAmount/1000)}k</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        * Interactive Graph: Click on any month's bar to view the exact performance details.
                    </div>
                </div>
                <div className="clay-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><PieChart color="var(--primary)" /> Quick Stats</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-in)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Average Commission %</p>
                            <h2 style={{ fontSize: '1.8rem', color: '#2D3436' }}>6.8%</h2>
                        </div>
                        <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-in)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total Fruit Handled</p>
                            <h2 style={{ fontSize: '1.8rem', color: '#2D3436' }}>12,450 Crates</h2>
                        </div>
                        <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', boxShadow: 'var(--clay-shadow-in)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Market Fees Due</p>
                            <h2 style={{ fontSize: '1.8rem', color: 'var(--danger)' }}>₨ 45,200</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="clay-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Recent Settlements</h3>
                    <div className="badge-clay" style={{ background: '#e0f2fe', color: '#0369a1' }}><Clock size={14} /> LIVE LEDGER</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Date & Time</th>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Beypari Name</th>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Sale Amount</th>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Comm. Rate</th>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Earned (PKR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.map((s, i) => {
                                const earned = calculateEarned(s.sale, s.rate);
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                        <td style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>{s.date}</td>
                                        <td style={{ padding: '1.5rem 1rem', fontWeight: 700, color: '#1a1a1a' }}>{s.name}</td>
                                        <td style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>₨ {s.sale.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 1rem' }}>
                                            <span style={{ background: 'var(--warm-bg)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}>{s.rate}%</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 1rem' }}>
                                            <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem' }}>+ ₨ {earned.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Commission;
