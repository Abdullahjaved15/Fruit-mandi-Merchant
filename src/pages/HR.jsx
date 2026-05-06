import React, { useState, useMemo, useEffect } from 'react';
import api from '../api/axios';
import { 
    Search, UserPlus, Filter, Download, MoreVertical, CheckCircle, Clock, Calendar, 
    Users, X, ShieldCheck, Mail, Phone, Briefcase, DollarSign, Trash2, Edit3, Eye, FileText,
    ArrowUpRight, Award, UserCheck
} from 'lucide-react';

const HR = () => {
    const [employees, setEmployees] = useState([]);

    // Silently load real data from DB in background
    useEffect(() => {
        api.get('/data/employees')
            .then(({ data }) => { 
                if (data && data.length > 0) {
                    setEmployees(data.map(e => ({ 
                        ...e, 
                        id: e._id,
                        name: e.name || 'Unknown Staff',
                        role: e.role || 'Staff',
                        joined: e.joined || 'N/A',
                        attendance: e.attendance || '0',
                        salary: e.salary || '0',
                        status: e.status || 'Present',
                        phone: e.phone || '-',
                        email: e.email || '-'
                    }))); 
                }
            })
            .catch((err) => console.error("HR fetch fail:", err));
    }, []);

    const [showHireModal, setShowHireModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [moreMenuId, setMoreMenuId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [sortBy, setSortBy] = useState("Name");

    const [newStaff, setNewStaff] = useState({ name: '', role: 'Warehouse Manager', salary: '', phone: '' });

    const handleHire = (e) => {
        e.preventDefault();
        const staff = {
            ...newStaff,
            joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
            attendance: "100",
            status: "Present",
            email: `${(newStaff.name || '').toLowerCase().replace(' ', '.')}@kissan.com`
        };
        // Update UI instantly
        setEmployees([staff, ...employees]);
        setShowHireModal(false);
        setNewStaff({ name: '', role: 'Warehouse Manager', salary: '', phone: '' });
        // Save to DB silently
        api.post('/data/employees', staff).catch((err) => console.error("HR save fail:", err));
    };

    const deleteStaff = (id) => {
        if(window.confirm("Are you sure you want to terminate this employee?")) {
            setEmployees(employees.filter(emp => emp.id !== id));
            setMoreMenuId(null);
            // Save to DB silently
            api.delete(`/data/employees/${id}`).catch((err) => console.error("HR delete fail:", err));
        }
    };

    const updateStatus = (id, newStatus) => {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp));
        setMoreMenuId(null);
    };

    const filteredEmployees = useMemo(() => {
        let result = employees.filter(emp => 
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            emp.role.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterStatus !== "All") {
            result = result.filter(emp => emp.status === filterStatus);
        }

        if (sortBy === "Salary") {
            result = [...result].sort((a, b) => parseInt(b.salary) - parseInt(a.salary));
        } else if (sortBy === "Punctuality") {
            result = [...result].sort((a, b) => parseInt(b.attendance) - parseInt(a.attendance));
        }

        return result;
    }, [employees, searchQuery, filterStatus, sortBy]);

    return (
        <div className="page-content" onClick={() => setMoreMenuId(null)}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Human Resources</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your team's payroll, attendance, and duty rosters.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="clay-button primary" onClick={() => setShowHireModal(true)}><UserPlus size={20} /> Hire Staff</button>
                    <button className="clay-button" onClick={() => setShowAttendanceModal(true)}><Download size={20} /> Attendance Report</button>
                </div>
            </header>

            {/* Profile Modal */}
            {selectedEmployee && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div 
                        style={{ position: 'absolute', inset: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setSelectedEmployee(null)}
                    ></div>
                    <div className="clay-card modal-scale-up" style={{ width: '100%', maxWidth: '600px', padding: '3.5rem', position: 'relative', background: 'white', borderRadius: '50px', boxShadow: '0 50px 100px rgba(0,0,0,0.12)' }}>
                        <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedEmployee(null)}>
                            <X size={26} color="#2D3436" strokeWidth={2.5} />
                        </button>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'var(--warm-bg)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                                {selectedEmployee.name.charAt(0)}
                            </div>
                            <h2 style={{ fontSize: '2.2rem' }}>{selectedEmployee.name}</h2>
                            <p style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>{selectedEmployee.role}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                            <div className="clay-card" style={{ padding: '1.2rem', background: 'var(--warm-bg)', boxShadow: 'none' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Joined Date</div>
                                <div style={{ fontWeight: 700 }}>{selectedEmployee.joined}</div>
                            </div>
                            <div className="clay-card" style={{ padding: '1.2rem', background: 'var(--warm-bg)', boxShadow: 'none' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Monthly Salary</div>
                                <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>₨ {parseInt(selectedEmployee.salary).toLocaleString()}</div>
                            </div>
                            <div className="clay-card" style={{ padding: '1.2rem', background: 'var(--warm-bg)', boxShadow: 'none' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Attendance</div>
                                <div style={{ fontWeight: 700 }}>{selectedEmployee.attendance}%</div>
                            </div>
                            <div className="clay-card" style={{ padding: '1.2rem', background: 'var(--warm-bg)', boxShadow: 'none' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Work Email</div>
                                <div style={{ fontWeight: 700 }}>{selectedEmployee.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="clay-button primary" style={{ flex: 1, height: '60px' }} onClick={() => { alert(`Call ${selectedEmployee.name} at ${selectedEmployee.phone}`); }}><Phone size={18} /> Call Private</button>
                            <button className="clay-button" style={{ flex: 1 }} onClick={() => { window.print(); }}><FileText size={18} /> Print Record</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hire Staff Modal */}
            {showHireModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div 
                        style={{ position: 'absolute', inset: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setShowHireModal(false)}
                    ></div>
                    <div className="clay-card modal-scale-up" style={{ width: '100%', maxWidth: '520px', padding: '4rem', position: 'relative', background: 'white', borderRadius: '50px', boxShadow: '0 50px 100px rgba(0,0,0,0.12)' }}>
                        <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowHireModal(false)}>
                            <X size={26} color="#2D3436" strokeWidth={2.5} />
                        </button>
                        <h2 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><UserPlus color="var(--primary)" /> Recruit Staff</h2>
                        <form onSubmit={handleHire} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>Full Name</label>
                                <input type="text" required className="clay-input" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. Hammad Safdar" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>Designated Role</label>
                                <select className="clay-input" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                                    <option>Warehouse Manager</option>
                                    <option>Account Clerk</option>
                                    <option>Delivery Driver</option>
                                    <option>Helper</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>Monthly Salary (₨)</label>
                                    <input type="number" required className="clay-input" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: e.target.value})} placeholder="35000" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>Phone Number</label>
                                    <input type="text" required className="clay-input" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} placeholder="03xx-xxxxxxx" />
                                </div>
                            </div>
                            <button type="submit" className="clay-button primary" style={{ marginTop: '1rem', height: '65px', fontSize: '1.2rem', borderRadius: '22px' }}>Confirm Hire</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendance Report Modal */}
            {showAttendanceModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem' }}>
                    <div 
                        style={{ position: 'absolute', inset: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.3)', zIndex: -1 }}
                        onClick={() => setShowAttendanceModal(false)}
                    ></div>
                    <div className="clay-card modal-scale-up" style={{ width: '100%', maxWidth: '620px', padding: '4rem', position: 'relative', background: 'white', borderRadius: '50px', boxShadow: '0 50px 100px rgba(0,0,0,0.12)' }}>
                        <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAttendanceModal(false)}>
                            <X size={26} color="#2D3436" strokeWidth={2.5} />
                        </button>
                        <h2 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><FileText color="var(--primary)" /> Monthly Attendance</h2>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div className="clay-card" style={{ background: 'var(--warm-bg)', boxShadow: 'none', padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Average Team Punctuality</span>
                                    <b style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>{Math.round(employees.reduce((acc,e)=>acc+parseInt(e.attendance),0)/employees.length)}%</b>
                                </div>
                                <div className="progress-bar-bg" style={{ height: '12px', borderRadius: '10px' }}>
                                    <div className="progress-bar-fill" style={{ width: '94%', background: 'var(--primary)', borderRadius: '10px' }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="clay-card" style={{ textAlign: 'center', padding: '2rem', background: '#f0fdf4', border: 'none' }}>
                                    <h4 style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>On-Time</h4>
                                    <h2 style={{ fontSize: '2.2rem', color: '#166534' }}>{employees.filter(e=>parseInt(e.attendance)>90).length}</h2>
                                </div>
                                <div className="clay-card" style={{ textAlign: 'center', padding: '2rem', background: '#fef2f2', border: 'none' }}>
                                    <h4 style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Late Entry</h4>
                                    <h2 style={{ fontSize: '2.2rem', color: '#991b1b' }}>{employees.filter(e=>parseInt(e.attendance)<=90).length}</h2>
                                </div>
                            </div>
                        </div>
                        <button className="clay-button primary" style={{ width: '100%', marginTop: '2.5rem', height: '65px', borderRadius: '22px' }} onClick={() => alert('Downloading PDF Ledger...')}>Download Full PDF Report</button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><Users style={{ width: '24px' }} /></div>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Total Team</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>{employees.length} Members</h2>
                </div>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#e0f2fe', color: '#075985' }}><CheckCircle style={{ width: '24px' }} /></div>
                        <span style={{ color: '#0369a1', fontWeight: 'bold' }}>Present Today</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>{employees.filter(e => e.status !== 'Absent').length} Active</h2>
                </div>
                <div className="clay-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><Calendar style={{ width: '24px' }} /></div>
                        <span style={{ color: '#b45309', fontWeight: 'bold' }}>Monthly Payroll</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>₨ {employees.reduce((acc, emp) => acc + parseInt(emp.salary), 0).toLocaleString()}</h2>
                </div>
            </div>

            <div className="clay-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
                        <input type="text" className="clay-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search team member..." style={{ paddingLeft: '3rem' }} />
                    </div>
                    <button className="clay-button" onClick={() => setShowFilterModal(!showFilterModal)}><Filter size={18} /> {showFilterModal ? 'Close Filter' : 'Filter'}</button>
                </div>

                {showFilterModal && (
                    <div className="clay-card" style={{ marginBottom: '2rem', background: 'var(--warm-bg)', boxShadow: 'none', padding: '1.5rem', display: 'flex', gap: '2rem', animation: 'slideDownFade 0.2s ease-out' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>SORT BY</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className={`clay-button ${sortBy === 'Salary' ? 'primary' : ''}`} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setSortBy('Salary')}>Salary (High)</button>
                                <button className={`clay-button ${sortBy === 'Punctuality' ? 'primary' : ''}`} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setSortBy('Punctuality')}>Punctuality</button>
                                <button className={`clay-button ${sortBy === 'Name' ? 'primary' : ''}`} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setSortBy('Name')}>Default</button>
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>STUDY BY STATUS</span>
                            <select 
                                className="clay-input" 
                                style={{ width: '150px', padding: '0.4rem 1rem' }} 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Staff</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="On Field">On Field</option>
                            </select>
                        </div>
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Employee Details</th>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Designation</th>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Monthly Punctuality</th>
                                <th style={{ padding: '1.5rem 1rem', color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((e, i) => (
                                <tr key={e.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', position: 'relative' }}>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--warm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-dark)' }}>
                                                {e.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{e.name}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Id: 00{e.id} | Joined: {e.joined}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{e.role}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 700 }}>₨ {parseInt(e.salary).toLocaleString()}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="progress-bar-bg" style={{ width: '100px', height: '8px' }}>
                                                <div className="progress-bar-fill" style={{ width: `${e.attendance}%`, background: parseInt(e.attendance) > 90 ? 'var(--success)' : 'var(--accent)' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{e.attendance}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem' }}>
                                        <div 
                                            className="clay-chip" 
                                            style={{ 
                                                background: e.status === 'Present' ? '#dcfce7' : e.status === 'Absent' ? '#fee2e2' : '#e0f2fe',
                                                color: e.status === 'Present' ? '#166534' : e.status === 'Absent' ? '#991b1b' : '#075985',
                                                boxShadow: 'none', border: '1px solid rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <UserCheck size={14} /> {e.status}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 1rem', textAlign: 'right', position: 'relative' }}>
                                        <button 
                                            className="clay-button" 
                                            style={{ padding: '0.6rem' }}
                                            onClick={(ev) => { ev.stopPropagation(); setMoreMenuId(moreMenuId === e.id ? null : e.id); }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {moreMenuId === e.id && (
                                            <div className="clay-card" style={{ position: 'absolute', top: '70%', right: '1rem', width: '220px', zIndex: 100, padding: '0.8rem', background: 'white', textAlign: 'left', animation: 'scaleUp 0.15s ease-out', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                                <div style={{ display: 'grid', gap: '0.2rem' }}>
                                                    <button className="menu-item-clay" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '12px' }} onClick={() => setSelectedEmployee(e)}>
                                                        <Eye size={16} /> View Profile
                                                    </button>
                                                    <button className="menu-item-clay" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '12px' }} onClick={() => updateStatus(e.id, 'Present')}>
                                                        <CheckCircle size={16} /> Mark Present
                                                    </button>
                                                    <button className="menu-item-clay" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '12px' }} onClick={() => updateStatus(e.id, 'Absent')}>
                                                        <X size={16} /> Mark Absent
                                                    </button>
                                                    <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '0.4rem 0' }} />
                                                    <button 
                                                        className="menu-item-clay" 
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '12px', color: 'var(--danger)' }}
                                                        onClick={() => deleteStaff(e.id)}
                                                    >
                                                        <Trash2 size={16} /> Terminate
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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

export default HR;
