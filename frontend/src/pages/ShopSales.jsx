import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Plus, Search, Trash2, ShoppingCart, X } from 'lucide-react';

const STAFF_OPTIONS = ['STAFF-A', 'STAFF-B', 'STAFF-C', 'STAFF-D', 'STAFF-E'];

const emptyForm = {
    saleDate: new Date().toISOString().slice(0, 10),
    consignment: '',
    beypari: '',
    customer: '',
    customerName: '',
    productName: '',
    inventoryItem: '',
    commissionRate: 0,
    quantity: '',
    ratePerUnit: '',
    paymentMode: 'spot',
    spotAmount: '',
    udhaarAmount: '',
    copybookStaff: 'STAFF-A',
};

const ShopSales = () => {
    const [sales, setSales] = useState([]);
    const [consignments, setConsignments] = useState([]);
    const [beyparis, setBeyparis] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const totalPreview = useMemo(() => {
        const q = parseFloat(form.quantity) || 0;
        const r = parseFloat(form.ratePerUnit) || 0;
        return q * r;
    }, [form.quantity, form.ratePerUnit]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            let staffRes;
            try {
                staffRes = await api.get('/data/staff-copybooks');
            } catch {
                staffRes = await api.post('/data/staff-copybooks');
            }
            const [salesRes, consRes, beyRes, custRes, invRes] = await Promise.all([
                api.get('/data/shop-sales'),
                api.get('/data/consignments?status=active'),
                api.get('/data/beyparis'),
                api.get('/data/customers'),
                api.get('/data/inventory'),
            ]);
            setSales(salesRes.data || []);
            setConsignments(consRes.data || []);
            setBeyparis(beyRes.data || []);
            setCustomers(custRes.data || []);
            setStaff(staffRes.data || []);
            setInventory((invRes.data || []).filter((item) => item.stock > 0 && item.isSoldInShop !== false));
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const onConsignmentChange = (id) => {
        const c = consignments.find((x) => x._id === id);
        setForm((f) => ({
            ...f,
            consignment: id,
            beypari: c?.beypari?._id || c?.beypari || '',
            commissionRate: c?.beypari?.commissionRate || 0,
            productName: c?.productName || f.productName,
        }));
    };

    const onInventoryItemChange = (val) => {
        if (!val) {
            setForm((f) => ({ ...f, productName: '', inventoryItem: '', commissionRate: 0 }));
            return;
        }
        
        // val might be item._id if we use it in the select
        const item = inventory.find(i => i._id === val);
        if (item) {
            // Find beypari from inventory item's beypariId, or if it matches by name
            const linkedBeypari = item.beypariId 
                ? beyparis.find(b => b._id === item.beypariId || b.partnerId === item.beypariId)
                : beyparis.find(b => b.name === item.beypariName);

            setForm((f) => ({
                ...f,
                inventoryItem: item._id,
                productName: item.name,
                beypari: linkedBeypari?._id || f.beypari,
                commissionRate: linkedBeypari?.commissionRate || f.commissionRate || 0,
            }));
        } else {
            setForm((f) => ({ ...f, productName: val, inventoryItem: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            saleDate: form.saleDate,
            consignment: form.consignment || undefined,
            beypari: form.beypari || undefined,
            customer: form.customer || undefined,
            customerName: form.customerName,
            productName: form.productName,
            inventoryItem: form.inventoryItem || undefined,
            commissionRate: form.commissionRate || undefined,
            quantity: parseFloat(form.quantity),
            ratePerUnit: parseFloat(form.ratePerUnit),
            paymentMode: form.paymentMode,
            copybookStaff: form.copybookStaff,
        };
        if (form.paymentMode === 'mixed') {
            payload.spotAmount = parseFloat(form.spotAmount) || 0;
            payload.udhaarAmount = parseFloat(form.udhaarAmount) || totalPreview - payload.spotAmount;
        }
        try {
            const { data } = await api.post('/data/shop-sales', payload);
            setSales((prev) => [data, ...prev]);
            setShowModal(false);
            setForm(emptyForm);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to record sale');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sale?')) return;
        const prev = sales;
        setSales((s) => s.filter((x) => x._id !== id));
        try {
            await api.delete(`/data/shop-sales/${id}`);
        } catch {
            setSales(prev);
            setError('Failed to delete sale');
        }
    };

    const filtered = sales.filter((s) => {
        const q = searchTerm.toLowerCase();
        return (
            (s.productName || '').toLowerCase().includes(q) ||
            (s.customerName || '').toLowerCase().includes(q) ||
            (s.beypari?.name || '').toLowerCase().includes(q)
        );
    });

    const staffOptions = staff.length
        ? staff.map((s) => ({ value: s.staffCode, label: s.staffName }))
        : STAFF_OPTIONS.map((c) => ({ value: c, label: c }));

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Shop Sales</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Record floor sales linked to beyopari consignments</p>
                </div>
                <button type="button" className="clay-button primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> New Shop Sale
                </button>
            </header>

            {error && (
                <div className="clay-card" style={{ marginBottom: '1rem', padding: '1rem', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            <div className="clay-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Search style={{ color: 'var(--text-muted)' }} />
                    <input
                        className="clay-input"
                        placeholder="Search product, customer, beyopari..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', boxShadow: 'none' }}
                    />
                </div>
            </div>

            <div className="clay-card" style={{ overflow: 'auto' }}>
                {loading ? (
                    <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0f0' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th>Product</th>
                                <th>Qty × Rate</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Beyopari</th>
                                <th>Copybook</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(s.saleDate).toLocaleDateString('en-GB')}
                                    </td>
                                    <td>{s.productName || '—'}</td>
                                    <td>
                                        {s.quantity} × {Number(s.ratePerUnit).toLocaleString()}
                                    </td>
                                    <td>PKR {Number(s.totalAmount).toLocaleString()}</td>
                                    <td>
                                        <span className="badge">{s.paymentMode}</span>
                                        {s.udhaarAmount > 0 && (
                                            <small style={{ display: 'block', color: 'var(--text-muted)' }}>
                                                Udhar: {Number(s.udhaarAmount).toLocaleString()}
                                            </small>
                                        )}
                                    </td>
                                    <td>{s.beypari?.name || '—'}</td>
                                    <td>{s.copybookStaff}</td>
                                    <td>
                                        <button type="button" className="clay-button" onClick={() => handleDelete(s._id)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!filtered.length && (
                                <tr>
                                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No shop sales yet
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
                        background: 'rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                >
                    <div className="clay-card" style={{ maxWidth: '560px', width: '100%', padding: '2rem', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Record Shop Sale</h2>
                            <button type="button" className="clay-button" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label>
                                Sale date
                                <input
                                    type="date"
                                    className="clay-input"
                                    value={form.saleDate}
                                    onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Active consignment
                                <select
                                    className="clay-input"
                                    value={form.consignment}
                                    onChange={(e) => onConsignmentChange(e.target.value)}
                                >
                                    <option value="">— Optional —</option>
                                    {consignments.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.productName} — {c.beypari?.name || 'Beyopari'} (min{' '}
                                            {Number(c.minimumTargetAmount).toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Active consignment links this sale to a currently open transaction batch. It is optional; select it when the sale belongs to an active consignment for tracking and reporting.
                                </p>
                            </label>
                            <label>
                                Beyopari
                                <select
                                    className="clay-input"
                                    value={form.beypari}
                                    onChange={(e) => {
                                        const b = beyparis.find(x => x._id === e.target.value);
                                        setForm({ ...form, beypari: e.target.value, commissionRate: b?.commissionRate || 0 });
                                    }}
                                >
                                    <option value="">—</option>
                                    {beyparis.map((b) => (
                                        <option key={b._id} value={b._id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                                {form.commissionRate > 0 && (
                                    <p style={{ margin: '0.2rem 0', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Commission Rate: {form.commissionRate}%
                                    </p>
                                )}
                            </label>
                            <label>
                                Product name
                                {inventory.length > 0 ? (
                                    <select
                                        className="clay-input"
                                        value={form.inventoryItem || form.productName}
                                        onChange={(e) => onInventoryItemChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Select product from shop inventory</option>
                                        {inventory.map((item) => (
                                            <option key={item._id} value={item._id}>
                                                {item.name} {item.sku ? `(${item.sku})` : ''} — {item.stock} in stock
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="clay-input"
                                        value={form.productName}
                                        onChange={(e) => setForm({ ...form, productName: e.target.value, inventoryItem: '' })}
                                        placeholder="Product name"
                                        required
                                    />
                                )}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <label>
                                    Quantity
                                    <input
                                        type="number"
                                        className="clay-input"
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        required
                                        min="0.01"
                                        step="any"
                                    />
                                </label>
                                <label>
                                    Rate per unit (PKR)
                                    <input
                                        type="number"
                                        className="clay-input"
                                        value={form.ratePerUnit}
                                        onChange={(e) => setForm({ ...form, ratePerUnit: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </label>
                            </div>
                            <p style={{ fontWeight: 700 }}>Total: PKR {totalPreview.toLocaleString()}</p>
                            <label>
                                Customer (registered)
                                <select
                                    className="clay-input"
                                    value={form.customer}
                                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                                >
                                    <option value="">Walk-in / new name below</option>
                                    {customers.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name} ({c.customerId})
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Customer name (if walk-in)
                                <input
                                    className="clay-input"
                                    value={form.customerName}
                                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                />
                            </label>
                            <label>
                                Payment mode
                                <select
                                    className="clay-input"
                                    value={form.paymentMode}
                                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                                >
                                    <option value="spot">Spot (full cash)</option>
                                    <option value="udhaar">Udhaar (full credit)</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </label>
                            {form.paymentMode === 'mixed' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <label>
                                        Spot amount
                                        <input
                                            type="number"
                                            className="clay-input"
                                            value={form.spotAmount}
                                            onChange={(e) => setForm({ ...form, spotAmount: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Udhaar amount
                                        <input
                                            type="number"
                                            className="clay-input"
                                            value={form.udhaarAmount}
                                            onChange={(e) => setForm({ ...form, udhaarAmount: e.target.value })}
                                        />
                                    </label>
                                </div>
                            )}
                            <label>
                                Staff copybook
                                <select
                                    className="clay-input"
                                    value={form.copybookStaff}
                                    onChange={(e) => setForm({ ...form, copybookStaff: e.target.value })}
                                    required
                                >
                                    {staffOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button type="submit" className="clay-button primary" style={{ marginTop: '0.5rem' }}>
                                <ShoppingCart size={18} /> Record Sale
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopSales;
