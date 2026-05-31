import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Download, FileText, Calendar, TrendingUp, BarChart3, Clock, PieChart, X, Save, Filter } from 'lucide-react';

const Commission = () => {
    const [beyparis, setBeyparis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [rateEdits, setRateEdits] = useState({});
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        fetchBeyparis();
    }, []);

    const fetchBeyparis = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/data/beyparis');
            if (Array.isArray(data)) {
                setBeyparis(data.map((b) => ({
                    ...b,
                    commissionRate: b.commissionRate ?? 0,
                    partnerId: b.partnerId || b._id,
                })));
            }
        } catch (err) {
            console.error('Fetch Beyparis fail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (id, value) => {
        setRateEdits((prev) => ({ ...prev, [id]: value }));
    };

    const saveCommission = async (beypari) => {
        const nextRate = Number(rateEdits[beypari._id] ?? beypari.commissionRate);
        if (Number.isNaN(nextRate) || nextRate < 0) {
            setStatusMessage('Please enter a valid commission percentage.');
            return;
        }

        try {
            const { data } = await api.put(`/data/beyparis/${beypari._id}`, { commissionRate: nextRate });
            setBeyparis((prev) => prev.map((b) => b._id === beypari._id ? { ...b, commissionRate: data.commissionRate } : b));
            setRateEdits((prev) => ({ ...prev, [beypari._id]: '' }));
            setStatusMessage(`Commission rate saved for ${beypari.name}.`);
        } catch (err) {
            console.error('Save commission fail:', err);
            setStatusMessage('Unable to save commission rate.');
        }
    };

    const handleExportCSV = () => {
        const headers = ['Partner ID', 'Beypari Name', 'Commission Rate (%)'];
        const csvContent = [
            headers.join(','),
            ...beyparis.map((b) => `"${b.partnerId}","${b.name}",${b.commissionRate}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Beypari_Commission_Rates_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredBeyparis = beyparis.filter((b) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return [b.name, b.partnerId].some((field) => String(field || '').toLowerCase().includes(term));
    });

    const averageRate = beyparis.length > 0 ? (beyparis.reduce((sum, b) => sum + (Number(b.commissionRate) || 0), 0) / beyparis.length).toFixed(1) : '0';

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Beypari Commission Manager</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Assign, review, and save commission rates for each Beypari partner.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="clay-button primary" onClick={handleExportCSV}><Download size={18} /> Export CSV</button>
                </div>
            </header>

            {statusMessage && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'var(--warm-bg)', borderRadius: '20px', color: 'var(--text-main)', fontWeight: 600 }}>
                    {statusMessage}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="clay-card" style={{ padding: '1.75rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700 }}>TOTAL PARTNERS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{beyparis.length}</div>
                </div>
                <div className="clay-card" style={{ padding: '1.75rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700 }}>AVERAGE RATE</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{averageRate}%</div>
                </div>
                <div className="clay-card" style={{ padding: '1.75rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700 }}>ACTIVE PARTNERS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{beyparis.length}</div>
                </div>
            </div>

            <div className="clay-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
                        <input
                            type="text"
                            className="clay-input"
                            placeholder="Search Beypari, ID, or region..."
                            style={{ paddingLeft: '3rem', width: '100%' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="clay-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter size={18} /> Filter</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.08)' }}>
                                <th style={{ padding: '1.4rem 1rem', color: 'var(--text-muted)' }}>Partner</th>
                                <th style={{ padding: '1.4rem 1rem', color: 'var(--text-muted)' }}>Current Rate</th>
                                <th style={{ padding: '1.4rem 1rem', color: 'var(--text-muted)' }}>New Rate (%)</th>
                                <th style={{ padding: '1.4rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading partners...</td>
                                </tr>
                            ) : filteredBeyparis.length > 0 ? filteredBeyparis.map((b) => (
                                <tr key={b._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                    <td style={{ padding: '1.4rem 1rem' }}>
                                        <div style={{ fontWeight: 700 }}>{b.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{b.partnerId}</div>
                                    </td>
                                    <td style={{ padding: '1.4rem 1rem' }}>
                                        <span style={{ background: 'var(--warm-bg)', padding: '0.45rem 0.9rem', borderRadius: '12px', fontWeight: 700 }}>{Number(b.commissionRate || 0).toFixed(1)}%</span>
                                    </td>
                                    <td style={{ padding: '1.4rem 1rem' }}>
                                        <input
                                            type="number"
                                            className="clay-input"
                                            value={rateEdits[b._id] ?? b.commissionRate ?? 0}
                                            onChange={(e) => handleRateChange(b._id, e.target.value)}
                                            style={{ width: '100px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '1.4rem 1rem', textAlign: 'right' }}>
                                        <button className="clay-button primary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => saveCommission(b)}><Save size={16} /> Save</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No Beyparis found matching "{searchTerm}".</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Commission;
