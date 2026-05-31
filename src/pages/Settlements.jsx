import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, CheckCircle, X, FileText } from 'lucide-react';

const Settlements = () => {
    const [settlements, setSettlements] = useState([]);
    const [consignments, setConsignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [summary, setSummary] = useState(null);
    const [form, setForm] = useState({
        consignment: '',
        commissionAmount: '',
        fuelCost: '',
        otherDeductions: '0',
        notes: '',
    });
    const [error, setError] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [setRes, consRes] = await Promise.all([
                api.get('/data/beypari-settlements'),
                api.get('/data/consignments?status=active'),
            ]);
            setSettlements(setRes.data || []);
            setConsignments(consRes.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load settlements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const loadSummary = async (consignmentId) => {
        if (!consignmentId) {
            setSummary(null);
            return;
        }
        try {
            const { data } = await api.get(`/data/consignments/${consignmentId}/summary`);
            setSummary(data);
            const c = data.consignment;
            setForm((f) => ({
                ...f,
                consignment: consignmentId,
                fuelCost: String(c.fuelCost ?? ''),
                commissionAmount: String(
                    Math.round((data.grossSales * (data.consignment?.beypari?.commissionRate || 0)) / 100) || ''
                ),
            }));
        } catch {
            setSummary(null);
        }
    };

    const netPreview = () => {
        if (!summary) return 0;
        const gross = summary.grossSales || 0;
        const comm = parseFloat(form.commissionAmount) || 0;
        const fuel = parseFloat(form.fuelCost) || 0;
        const other = parseFloat(form.otherDeductions) || 0;
        return gross - comm - fuel - other;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/data/beypari-settlements', {
                consignment: form.consignment,
                commissionAmount: parseFloat(form.commissionAmount) || 0,
                fuelCost: parseFloat(form.fuelCost) || 0,
                otherDeductions: parseFloat(form.otherDeductions) || 0,
                notes: form.notes,
            });
            setSettlements((prev) => [data, ...prev]);
            setShowModal(false);
            setForm({ consignment: '', commissionAmount: '', fuelCost: '', otherDeductions: '0', notes: '' });
            setSummary(null);
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create settlement');
        }
    };

    const markPaid = async (id) => {
        try {
            const { data } = await api.put(`/data/beypari-settlements/${id}/mark-paid`, {
                paymentMethod: 'cash',
            });
            setSettlements((prev) => prev.map((s) => (s._id === id ? data : s)));
        } catch {
            setError('Failed to mark as paid');
        }
    };

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Beyopari Settlements</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manual commission, fuel deductions, and payouts</p>
                </div>
                <button type="button" className="clay-button primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> New Settlement
                </button>
            </header>

            {error && (
                <div className="clay-card" style={{ marginBottom: '1rem', padding: '1rem', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            <div className="clay-card" style={{ overflow: 'auto' }}>
                {loading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                                <th style={{ padding: '1rem' }}>Beyopari</th>
                                <th>Product</th>
                                <th>Gross</th>
                                <th>Commission</th>
                                <th>Fuel</th>
                                <th>Net Payable</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.map((s) => (
                                <tr key={s._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '1rem' }}>{s.beypari?.name || '—'}</td>
                                    <td>{s.consignment?.productName || '—'}</td>
                                    <td>PKR {Number(s.grossSales).toLocaleString()}</td>
                                    <td>PKR {Number(s.commissionAmount).toLocaleString()}</td>
                                    <td>PKR {Number(s.fuelCost).toLocaleString()}</td>
                                    <td style={{ fontWeight: 700 }}>PKR {Number(s.netPayable).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${s.status === 'paid' ? 'success' : 'accent'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td>
                                        {s.status === 'draft' && (
                                            <button
                                                type="button"
                                                className="clay-button primary"
                                                onClick={() => markPaid(s._id)}
                                            >
                                                <CheckCircle size={16} /> Mark Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!settlements.length && (
                                <tr>
                                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No settlements yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        minHeight: '100vh',
                        background: 'rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                        overflowY: 'auto',
                    }}
                >
                    <div className="clay-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>
                                <FileText size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                                Create Settlement
                            </h2>
                            <button type="button" className="clay-button" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label>
                                Consignment
                                <select
                                    className="clay-input"
                                    value={form.consignment}
                                    onChange={(e) => {
                                        setForm({ ...form, consignment: e.target.value });
                                        loadSummary(e.target.value);
                                    }}
                                    required
                                >
                                    <option value="">Select active consignment</option>
                                    {consignments.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.productName} — {c.beypari?.name} (target{' '}
                                            {Number(c.minimumTargetAmount).toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {summary && (
                                <div className="clay-card" style={{ padding: '1rem', background: '#f8faf8' }}>
                                    <p>
                                        Gross sales: <strong>PKR {Number(summary.grossSales).toLocaleString()}</strong>
                                    </p>
                                    <p>
                                        Min target: PKR {Number(summary.minimumTargetAmount).toLocaleString()}
                                        {summary.targetMet ? ' ✓ Met' : ` (${Number(summary.remainingToTarget).toLocaleString()} remaining)`}
                                    </p>
                                </div>
                            )}
                            <label>
                                Commission (manual PKR)
                                <input
                                    type="number"
                                    className="clay-input"
                                    value={form.commissionAmount}
                                    onChange={(e) => setForm({ ...form, commissionAmount: e.target.value })}
                                    min="0"
                                />
                            </label>
                            <label>
                                Fuel cost (PKR)
                                <input
                                    type="number"
                                    className="clay-input"
                                    value={form.fuelCost}
                                    onChange={(e) => setForm({ ...form, fuelCost: e.target.value })}
                                    min="0"
                                />
                            </label>
                            <label>
                                Other deductions
                                <input
                                    type="number"
                                    className="clay-input"
                                    value={form.otherDeductions}
                                    onChange={(e) => setForm({ ...form, otherDeductions: e.target.value })}
                                    min="0"
                                />
                            </label>
                            <label>
                                Notes
                                <textarea
                                    className="clay-input"
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                />
                            </label>
                            {summary && (
                                <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                    Net payable: PKR {netPreview().toLocaleString()}
                                </p>
                            )}
                            <button type="submit" className="clay-button primary">
                                Create Settlement
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settlements;
