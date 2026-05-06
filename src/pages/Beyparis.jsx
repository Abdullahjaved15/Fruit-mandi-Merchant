import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Filter, Download, MoreVertical, CheckCircle, Clock, AlertCircle, Users, X, Trash2, FileText, User, Phone, MapPin, Star, TrendingUp, Package } from 'lucide-react';

const Beyparis = () => {
    const navigate = useNavigate();
    const [consignors, setConsignors] = useState([]);

    // Silently load from DB in background - demo data shows instantly
    useEffect(() => {
        api.get('/data/beyparis')
            .then(({ data }) => { 
                if (data && data.length > 0) {
                    setConsignors(data.map(b => ({ 
                        ...b, 
                        id: b._id, // Use _id as the primary identifier for API calls
                        partnerId: b.partnerId || b._id, // Keep partnerId for display
                        balance: b.balance || '0.00',
                        status: b.status || 'Active',
                        area: b.area || 'Unknown',
                        phone: b.phone || '-',
                        joinDate: b.joinDate || 'N/A',
                        totalShipments: b.totalShipments || 0,
                        rating: b.rating || 0
                    }))); 
                }
            })
            .catch((err) => console.error("Beyparis fetch fail:", err)); // silent fail - keep demo data
    }, []);

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedBeypari, setSelectedBeypari] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All'); 
    const [openMenuId, setOpenMenuId] = useState(null);
    const [newBeypari, setNewBeypari] = useState({
        name: '',
        area: '',
        balance: '0.00',
        status: 'Active'
    });

    const handleAddBeypari = (e) => {
        e.preventDefault();
        const id = `B-${1020 + consignors.length + 1}`;
        const beypariToAdd = {
            name: newBeypari.name,
            id: id,
            partnerId: id,
            area: newBeypari.area || 'Unknown',
            rating: 5.0,
            status: newBeypari.status || 'Active',
            balance: newBeypari.balance || '0.00',
            phone: "+92 300 0000000",
            joinDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            totalShipments: 0
        };
        // Update UI immediately (optimistic update)
        setConsignors(prev => [...prev, beypariToAdd]);
        setShowAddModal(false);
        setNewBeypari({ name: '', area: '', balance: '0.00', status: 'Active' });
        // Save to DB silently in background
        api.post('/data/beyparis', beypariToAdd).catch((err) => console.error("Beyparis post fail:", err));
    };

    const handleDeleteBeypari = (id) => {
        if (window.confirm('Are you sure you want to remove this Beypari? This action cannot be undone.')) {
            // Update UI immediately (optimistic)
            setConsignors(prev => prev.filter(c => c.id !== id));
            setOpenMenuId(null);
            // Delete from DB
            api.delete(`/data/beyparis/${id}`)
                .then(() => console.log("Beypari deleted from DB"))
                .catch((err) => {
                    console.error("Beyparis delete fail:", err);
                    alert("Failed to delete from database. Please check your connection.");
                });
        }
    };

    const handleExport = () => {
        const headers = ["Name", "ID", "Region", "Balance", "Rating", "Status"];
        const csvContent = [
            headers.join(","),
            ...consignors.map(c => `${c.name || ''},${c.id || ''},${c.area || ''},${c.balance || ''},${c.rating || 0},${c.status || ''}`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Beypari_List_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const cycleFilter = () => {
        const filters = ['All', 'Active', 'Pending Settlement', 'Inactive'];
        const currentIndex = filters.indexOf(activeFilter);
        setActiveFilter(filters[(currentIndex + 1) % filters.length]);
    };

    const filteredBeyparis = consignors.filter(c => {
        const name = (c.name || '').toLowerCase();
        const id = (c.id || c.partnerId || '').toLowerCase();
        const area = (c.area || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        const matchesSearch = name.includes(term) || id.includes(term) || area.includes(term);
        const matchesFilter = activeFilter === 'All' || (c.status || '').toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="page-content" onClick={() => setOpenMenuId(null)}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Beypari Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track consignments, commission rates, and payouts for your partner farmers.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="clay-button primary" onClick={() => setShowAddModal(true)}><UserPlus /> Add New Beypari</button>
                    <button className="clay-button" onClick={handleExport}><Download /> Export</button>
                </div>
            </header>

            {/* Profile Detail Modal */}
            {selectedBeypari && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(15px)', 
                    zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' 
                }} onClick={() => setSelectedBeypari(null)}>
                    <div className="clay-card" style={{ 
                        maxWidth: '600px', width: '100%', padding: '3rem', borderRadius: '40px', 
                        animation: 'scaleUp 0.4s ease', background: 'white' 
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div className="clay-icon-circle" style={{ width: '80px', height: '80px', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '1.5rem', fontWeight: 800 }}>
                                    {(selectedBeypari.name || 'P').charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{selectedBeypari.name || 'Beypari Profile'}</h2>
                                    <span className="clay-chip" style={{ background: 'var(--warm-bg)' }}>Partner ID: {selectedBeypari.id}</span>
                                </div>
                            </div>
                            <button className="clay-button" style={{ width: '40px', height: '40px', padding: 0 }} onClick={() => setSelectedBeypari(null)}><X /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                            <div className="clay-card" style={{ padding: '1.25rem', boxShadow: 'var(--clay-shadow-in)', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.85rem' }}><Phone size={14} /> Contact</div>
                                <div style={{ fontWeight: 700 }}>{selectedBeypari.phone || '-'}</div>
                            </div>
                            <div className="clay-card" style={{ padding: '1.25rem', boxShadow: 'var(--clay-shadow-in)', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.85rem' }}><MapPin size={14} /> Location</div>
                                <div style={{ fontWeight: 700 }}>{selectedBeypari.area || 'Unknown'}</div>
                            </div>
                            <div className="clay-card" style={{ padding: '1.25rem', boxShadow: 'var(--clay-shadow-in)', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.85rem' }}><Star size={14} /> Trust Rating</div>
                                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{selectedBeypari.rating || 0} / 5.0 <Clock size={14} style={{ color: 'var(--accent)' }}/></div>
                            </div>
                            <div className="clay-card" style={{ padding: '1.25rem', boxShadow: 'var(--clay-shadow-in)', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.85rem' }}><TrendingUp size={14} /> Active Since</div>
                                <div style={{ fontWeight: 700 }}>{selectedBeypari.joinDate || 'N/A'}</div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', background: 'var(--warm-bg)', padding: '1.5rem', borderRadius: '28px', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>CURRENT BALANCE STATEMENT</div>
                            <div style={{ 
                                fontSize: '2.2rem', 
                                fontWeight: 800, 
                                color: (selectedBeypari.balance || '').includes('Cr') || (selectedBeypari.balance || '').includes('+') ? 'var(--success)' : 
                                       ((selectedBeypari.balance || '').includes('Dr') || (selectedBeypari.balance || '').includes('-') ? 'var(--danger)' : 'inherit')
                            }}>
                                {selectedBeypari.balance || '0.00'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><Package size={16} /> <b>{selectedBeypari.totalShipments || 0}</b> Total Shipments</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="clay-button primary" style={{ flex: 1, padding: '1.1rem', borderRadius: '18px' }} onClick={() => navigate('/ledger')}>View Full Ledger</button>
                            <button className="clay-button" style={{ flex: 1, padding: '1.1rem', borderRadius: '18px' }} onClick={() => { alert('Partner support line: ' + (selectedBeypari.phone || 'No phone data')); }}>Contact Partner</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Beypari Modal */}
            {showAddModal && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', 
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' 
                }} onClick={(e) => e.stopPropagation()}>
                    <div className="clay-card" style={{ 
                        maxWidth: '500px', width: '100%', padding: '2.5rem', borderRadius: '45px', 
                        animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', background: 'white' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Onboard New Beypari</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', borderRadius: '12px', color: 'var(--danger)', boxShadow: 'none', background: 'rgba(255,0,0,0.05)' }} onClick={() => setShowAddModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleAddBeypari} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
                                <input 
                                    type="text" required className="clay-input" placeholder="e.g. Rahim Yar Khan Farms" 
                                    value={newBeypari.name} onChange={(e) => setNewBeypari({...newBeypari, name: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Region/Area</label>
                                    <input 
                                        type="text" required className="clay-input" placeholder="e.g. Sindh" 
                                        value={newBeypari.area} onChange={(e) => setNewBeypari({...newBeypari, area: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Initial Balance</label>
                                    <input 
                                        type="text" className="clay-input" placeholder="e.g. 0.00" 
                                        value={newBeypari.balance} onChange={(e) => setNewBeypari({...newBeypari, balance: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</label>
                                <select 
                                    className="clay-input" value={newBeypari.status} 
                                    onChange={(e) => setNewBeypari({...newBeypari, status: e.target.value})}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending Settlement">Pending Settlement</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <button type="submit" className="clay-button primary" style={{ width: '100%', marginTop: '1rem', height: '60px', borderRadius: '22px', fontSize: '1.1rem' }}>Complete Registration</button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><Users style={{ width: '24px' }} /></div>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Active Partners</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>{consignors.filter(c => c.status === 'Active').length}</h2>
                </div>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#e0f2fe', color: '#075985' }}><Clock style={{ width: '24px' }} /></div>
                        <span style={{ color: '#0369a1', fontWeight: 'bold' }}>Pending Settlement</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>{consignors.filter(c => c.status === 'Pending Settlement').length}</h2>
                </div>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><AlertCircle style={{ width: '24px' }} /></div>
                        <span style={{ color: '#b45309', fontWeight: 'bold' }}>Total Region</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>{[...new Set(consignors.map(c => c.area || 'Unknown'))].length}</h2>
                </div>
            </div>

            <div className="clay-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
                        <input 
                            type="text" 
                            className="clay-input" 
                            placeholder="Search by name, ID or region..." 
                            style={{ paddingLeft: '3rem' }} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className={`clay-button ${activeFilter !== 'All' ? 'primary' : ''}`}
                        onClick={(e) => { e.stopPropagation(); cycleFilter(); }}
                    >
                        <Filter style={{ width: '18px' }} /> {activeFilter === 'All' ? 'Filter' : activeFilter}
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name & ID</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Region</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Current Balance</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBeyparis.length > 0 ? filteredBeyparis.map((c, i) => (
                                <tr key={c.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', position: 'relative' }}>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{c.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{c.id || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>{c.area || 'Unknown'}</td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '12px',
                                            background: (c.balance || '').includes('+') || (c.balance || '').includes('Cr') ? '#dcfce7' : ((c.balance || '').includes('-') || (c.balance || '').includes('Dr') ? '#fee2e2' : 'white'),
                                            color: (c.balance || '').includes('+') || (c.balance || '').includes('Cr') ? '#166534' : ((c.balance || '').includes('-') || (c.balance || '').includes('Dr') ? '#991b1b' : 'inherit'),
                                            fontWeight: 'bold',
                                            boxShadow: 'var(--clay-shadow-in)'
                                        }}>
                                            {c.balance || '0.00'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                            <div className="status-dot" style={{ background: c.status === 'Active' ? 'var(--success)' : c.status === 'Inactive' ? 'var(--text-muted)' : 'var(--accent)' }}></div>
                                            {c.status || 'Active'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <button 
                                                className="clay-button" 
                                                style={{ padding: '0.5rem', borderRadius: '10px' }} 
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === c.id ? null : c.id); }}
                                            >
                                                <MoreVertical style={{ width: '18px' }} />
                                            </button>

                                            {openMenuId === c.id && (
                                                <div className="clay-card" style={{ 
                                                    position: 'absolute', right: '3.5rem', top: '10%', zIndex: 100, 
                                                    padding: '0.5rem', minWidth: '180px', animation: 'scaleUp 0.3s ease',
                                                    background: 'white', border: '1px solid rgba(0,0,0,0.05)'
                                                }} onClick={(e) => e.stopPropagation()}>
                                                    <button className="nav-link" style={{ width: '100%', color: 'var(--text-main)', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => { setSelectedBeypari(c); setOpenMenuId(null); }}><User size={16} /> View Profile</button>
                                                    <button className="nav-link" style={{ width: '100%', color: 'var(--text-main)', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => { navigate('/ledger'); setOpenMenuId(null); }}><FileText size={16} /> View Ledger</button>
                                                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.2rem 0' }}></div>
                                                    <button className="nav-link" style={{ width: '100%', color: 'var(--danger)', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => handleDeleteBeypari(c.id)}><Trash2 size={16} /> Remove Beypari</button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                        <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.2 }} />
                                        <p>No Beyparis found matching "{searchTerm}" {activeFilter !== 'All' ? `with status "${activeFilter}"` : ''}</p>
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

export default Beyparis;



