import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Printer, X } from 'lucide-react';

const Copybooks = () => {
    const [staffList, setStaffList] = useState([]);
    const [entries, setEntries] = useState([]);
    const [activeStaffCode, setActiveStaffCode] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        customerName: '',
        description: '',
        debit: '',
        credit: '',
    });
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            let staffRes;
            try {
                staffRes = await api.get('/data/staff-copybooks');
            } catch {
                staffRes = await api.post('/data/staff-copybooks');
            }
            const staff = staffRes.data || [];
            setStaffList(staff);
            if (!activeStaffCode && staff[0]) setActiveStaffCode(staff[0].staffCode);

            const code = activeStaffCode || staff[0]?.staffCode;
            if (code) {
                const { data } = await api.get(`/data/staff-copybooks/entries?staffCode=${code}`);
                setEntries(data || []);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load copybooks');
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeStaffCode]);

    const activeStaff = staffList.find((s) => s.staffCode === activeStaffCode);
    const latestBalance = entries.length ? entries[0].balanceAfter : 0;

    const handleManualEntry = async (e) => {
        e.preventDefault();
        if (!activeStaff) return;
        try {
            await api.post('/data/staff-copybooks/entries', {
                copybookId: activeStaff._id,
                type: 'manual',
                customerName: form.customerName,
                description: form.description,
                debit: parseFloat(form.debit) || 0,
                credit: parseFloat(form.credit) || 0,
            });
            setShowModal(false);
            setForm({ customerName: '', description: '', debit: '', credit: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add entry');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Staff Copybooks</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Registers A–E for customer udhaar and payments</p>
                </div>
                <button type="button" className="clay-button primary" onClick={() => setShowModal(true)} disabled={!activeStaff}>
                    <Plus size={18} /> Manual Entry
                </button>
            </header>

            {error && (
                <div className="clay-card" style={{ marginBottom: '1rem', padding: '1rem', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {staffList.map((s) => (
                    <button
                        key={s._id}
                        type="button"
                        className={`clay-button ${activeStaffCode === s.staffCode ? 'primary' : ''}`}
                        onClick={() => setActiveStaffCode(s.staffCode)}
                    >
                        {s.staffName}
                    </button>
                ))}
            </div>

            <div className="clay-card" id="printable-register">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>{activeStaff?.staffName || '—'} — Running balance</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0.5rem 0 0' }}>
                            PKR {Number(latestBalance).toLocaleString()}
                        </p>
                    </div>
                    <button type="button" className="clay-button" onClick={handlePrint}>
                        <Printer size={18} /> Print
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th>Customer</th>
                            <th>Description</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((e) => (
                            <tr key={e._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '1rem' }}>
                                    {new Date(e.entryDate).toLocaleDateString('en-GB')}
                                </td>
                                <td>{e.customerName || e.customer?.name || '—'}</td>
                                <td>{e.description}</td>
                                <td>{e.debit ? `PKR ${Number(e.debit).toLocaleString()}` : '—'}</td>
                                <td>{e.credit ? `PKR ${Number(e.credit).toLocaleString()}` : '—'}</td>
                                <td style={{ fontWeight: 700 }}>PKR {Number(e.balanceAfter).toLocaleString()}</td>
                            </tr>
                        ))}
                        {!entries.length && (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No entries yet. Sales with udhaar appear here automatically.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="clay-card" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Manual entry — {activeStaff?.staffName}</h2>
                            <button type="button" className="clay-button" onClick={() => setShowModal(false)}>
                                <X />
                            </button>
                        </div>
                        <form onSubmit={handleManualEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="clay-input" placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                            <input className="clay-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                            <input className="clay-input" type="number" placeholder="Debit (udhaar added)" min="0" value={form.debit} onChange={(e) => setForm({ ...form, debit: e.target.value })} />
                            <input className="clay-input" type="number" placeholder="Credit (payment received)" min="0" value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} />
                            <button type="submit" className="clay-button primary">Save entry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Copybooks;
