import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '../redux/authSlice';
import { User, Building, Lock, Globe, Save, UploadCloud, Shield, Smartphone, BellRing } from 'lucide-react';

const Settings = ({ authData }) => {
    const isUser = authData?.role === 'user';
    const [activeTab, setActiveTab] = useState(isUser ? 'Profile' : 'Profile'); // Could be 'Dashboard' for user
    const dispatch = useDispatch();
    const [profileData, setProfileData] = useState({ 
        name: authData?.name || (isUser ? 'Customer' : 'Admin'), 
        email: authData?.email || '', 
        phone: authData?.phone || '' 
    });
    const [businessData, setBusinessData] = useState({ company: 'Kamyab Kissan', address: 'Mandi Market, Faisalabad', ntn: 'PK-82710-X' });
    const [securityData, setSecurityData] = useState({ currentPass: '', newPass: '', confirmPass: '', twoFactor: false });
    const [notificationSettings, setNotificationSettings] = useState({ orders: true, news: false, security: true });
    const [regionData, setRegionData] = useState({ language: 'English', currency: 'PKR', timezone: 'Asia/Karachi' });
    const [statusMessage, setStatusMessage] = useState('');
    
    const [profileImg, setProfileImg] = useState(authData?.profileImage || null);
    const fileInputRef = useRef(null);

    // If no authData is passed, try to get from localStorage (fallback)
    useEffect(() => {
        if (authData) {
            setProfileData({
                name: authData.name || (isUser ? 'Customer' : 'Admin'),
                email: authData.email || '',
                phone: authData.phone || ''
            });
            setProfileImg(authData.profileImage || null);
        } else {
            const data = JSON.parse(localStorage.getItem('auth_data'));
            if (data) {
                setProfileData({
                    name: data.name || (isUser ? 'Customer' : 'Admin'),
                    email: data.email || '',
                    phone: data.phone || ''
                });
                setProfileImg(data.profileImage || null);
            }
        }
    }, [authData, isUser]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const { default: api } = await import('../api/axios');
            const uploadResult = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const backendRoot = api.defaults.baseURL.replace(/\/api$/, '');
            const imgUrl = uploadResult.data.image;
            const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${backendRoot}${imgUrl}`;
            const { data } = await api.put('/auth/profile', { profileImage: fullUrl });

            setProfileImg(data.profileImage || fullUrl);
            dispatch(updateUser({ profileImage: data.profileImage || fullUrl }));
            setStatusMessage('Profile picture updated successfully.');
        } catch (err) {
            console.error('Profile upload fail:', err);
            setStatusMessage('Could not upload profile picture.');
        }
    };

    // Fetch settings from DB on load
    useEffect(() => {
        import('../api/axios').then(({ default: api }) => {
            api.get('/data/system-settings').then(({ data }) => {
                if (data && data.length > 0) {
                    const business = data.find(s => s.key === 'business_info');
                    if (business) setBusinessData(business.value);
                    
                    const region = data.find(s => s.key === 'region_settings');
                    if (region) setRegionData(region.value);
                }
            }).catch(err => console.error("Settings fetch fail:", err));
        });
    }, []);

    const handleSave = async (e, section) => {
        e.preventDefault();
        setStatusMessage('');

        if (section === 'Profile') {
            try {
                const { default: api } = await import('../api/axios');
                const { data } = await api.put('/auth/profile', {
                    username: profileData.name,
                    email: profileData.email,
                    phone: profileData.phone,
                });

                setProfileData({
                    name: data.username,
                    email: data.email,
                    phone: data.phone || ''
                });
                dispatch(updateUser({
                    name: data.username,
                    email: data.email,
                    phone: data.phone || '',
                }));
                setStatusMessage('Profile updated successfully.');
            } catch (err) {
                console.error('Profile update fail:', err);
                setStatusMessage('Could not update profile.');
            }
            return;
        }

        import('../api/axios').then(({ default: api }) => {
            let key = '';
            let val = {};
            
            if (section === 'Business') {
                key = 'business_info';
                val = businessData;
            } else if (section === 'Region') {
                key = 'region_settings';
                val = regionData;
            }

            if (key) {
                api.get('/data/system-settings').then(({ data }) => {
                    const existing = data.find(s => s.key === key);
                    if (existing) {
                        api.put(`/data/system-settings/${existing._id}`, { key, value: val });
                    } else {
                        api.post('/data/system-settings', { key, value: val });
                    }
                }).finally(() => {
                    setStatusMessage(`${section} settings saved.`);
                });
            } else {
                setStatusMessage(`${section} settings updated.`);
            }
        });
    };

    const navItems = [
        { id: 'Profile', icon: <User />, label: 'Profile' },
        !isUser && { id: 'Business', icon: <Building />, label: 'Business Details' },
        { id: 'Security', icon: <Lock />, label: isUser ? 'Change Password' : 'Security & Pass' },
        { id: 'Region', icon: <Globe />, label: 'Region' },
        isUser && { id: 'Notifications', icon: <BellRing />, label: 'Notifications' },
    ].filter(Boolean);

    return (
        <div className="page-content">
        <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '0.5rem', color: '#1a1a1a', letterSpacing: '-1px' }}>
                    {isUser ? 'My Account' : 'Settings'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {isUser ? `Welcome back, ${profileData.name}. Manage your account here.` : 'Configure system-wide parameters and business enterprise details.'}
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr', gap: '2rem' }}>
                {/* Navigation Sidebar */}
                <div className="clay-card" style={{ height: 'fit-content', padding: '1.5rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {navItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`clay-button ${activeTab === item.id ? 'primary' : ''}`}
                                style={{ 
                                    justifyContent: 'flex-start', 
                                    padding: '1rem 1.5rem', 
                                    fontSize: '1rem',
                                    fontWeight: activeTab === item.id ? 800 : 600,
                                    background: activeTab === item.id ? 'var(--primary)' : 'var(--warm-bg)',
                                    color: activeTab === item.id ? '#ffffff' : 'var(--text-muted)',
                                    boxShadow: activeTab === item.id ? 'inset -5px -5px 10px rgba(0,0,0,0.1), inset 5px 5px 10px rgba(255,255,255,0.4)' : 'none',
                                    border: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <span style={{ opacity: activeTab === item.id ? 1 : 0.6, display: 'flex', alignItems: 'center' }}>
                                    {React.cloneElement(item.icon, { size: 20, style: regionData.language === 'Urdu (اردو)' ? { marginLeft: '1rem' } : { marginRight: '1rem' } })}
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="clay-card" style={{ padding: '3rem', minHeight: '500px', animation: 'fadeIn 0.3s ease-out' }}>
                    {statusMessage && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'var(--warm-bg)', borderRadius: '18px', color: 'var(--text-main)', fontWeight: 600 }}>
                            {statusMessage}
                        </div>
                    )}
                    {/* PROFILE TAB */}
                    {activeTab === 'Profile' && (
                        <div>
                            <h3 style={{ marginBottom: '2.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><User size={28} color="var(--primary)" /> Profile Information</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', padding: '1.5rem', background: 'var(--warm-bg)', borderRadius: '24px' }}>
                                <div style={{ width: '90px', height: '90px', borderRadius: '25px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', overflow: 'hidden' }}>
                                    {profileImg ? <img src={profileImg} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'J'}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Profile Picture</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>PNG, JPG under 2MB</p>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload} 
                                        style={{ display: 'none' }} 
                                        accept="image/png, image/jpeg" 
                                    />
                                    <button type="button" className="clay-button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => fileInputRef.current.click()}>
                                        <UploadCloud size={16} /> Upload New
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={(e) => handleSave(e, 'Profile')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{isUser ? 'Full Name' : 'Administrator Name'}</label>
                                        <input type="text" className="clay-input" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mobile Number</label>
                                        <input type="text" className="clay-input" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder="+92 300 0000000" />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Email Address</label>
                                    <input type="email" className="clay-input" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="clay-button primary" style={{ height: '55px', padding: '0 2rem', fontSize: '1.1rem' }}><Save size={20} /> Save Profile</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* BUSINESS TAB */}
                    {activeTab === 'Business' && (
                        <div style={{ animation: 'slideRight 0.3s ease-out' }}>
                            <h3 style={{ marginBottom: '2.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Building size={28} color="var(--primary)" /> Business Details</h3>
                            <form onSubmit={(e) => handleSave(e, 'Business')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Registered Company Name</label>
                                    <input type="text" className="clay-input" value={businessData.company} onChange={e => setBusinessData({...businessData, company: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>National Tax Number (NTN)</label>
                                    <input type="text" className="clay-input" value={businessData.ntn} onChange={e => setBusinessData({...businessData, ntn: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Office Address / Market Location</label>
                                    <textarea className="clay-input" rows="3" style={{ resize: 'none' }} value={businessData.address} onChange={e => setBusinessData({...businessData, address: e.target.value})}></textarea>
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="clay-button" style={{ height: '55px', padding: '0 2rem', fontSize: '1.1rem', background: '#e0f2fe', color: '#0369a1' }}><Save size={20} /> Update Business</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'Security' && (
                        <div style={{ animation: 'slideRight 0.3s ease-out' }}>
                            <h3 style={{ marginBottom: '2.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Shield size={28} color="var(--primary)" /> Security Settings</h3>
                            
                            {!isUser && (
                                <div className="clay-card" style={{ background: '#f8fafc', boxShadow: 'none', border: '2px solid #e2e8f0', marginBottom: '2.5rem', padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Smartphone size={18} color="var(--success)" /> Two-Factor Authentication</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Add an extra layer of security requiring an SMS code to login.</p>
                                        </div>
                                        <button 
                                            className={`clay-button ${securityData.twoFactor ? 'primary' : ''}`} 
                                            style={{ background: securityData.twoFactor ? 'var(--success)' : 'var(--warm-bg)', color: securityData.twoFactor ? 'white' : 'var(--text-muted)' }}
                                            onClick={() => setSecurityData({...securityData, twoFactor: !securityData.twoFactor})}
                                        >
                                            {securityData.twoFactor ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={(e) => handleSave(e, 'Security')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>Change Password</h4>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Current Password</label>
                                    <input type="password" required className="clay-input" value={securityData.currentPass} onChange={e => setSecurityData({...securityData, currentPass: e.target.value})} placeholder="••••••••" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>New Password</label>
                                        <input type="password" required className="clay-input" value={securityData.newPass} onChange={e => setSecurityData({...securityData, newPass: e.target.value})} placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Confirm New Password</label>
                                        <input type="password" required className="clay-input" value={securityData.confirmPass} onChange={e => setSecurityData({...securityData, confirmPass: e.target.value})} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="clay-button primary" style={{ height: '55px', padding: '0 2rem', fontSize: '1.1rem', background: '#3b82f6' }}><Lock size={20} /> Update Password</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* METRICS & REGION TAB */}
                    {activeTab === 'Region' && (
                        <div style={{ animation: 'slideRight 0.3s ease-out' }}>
                            <h3 style={{ marginBottom: '2.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Globe size={28} color="var(--primary)" /> Language & Region</h3>
                            <form onSubmit={(e) => handleSave(e, 'Region')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Dashboard Language</label>
                                    <select className="clay-input" value={regionData.language} onChange={e => setRegionData({...regionData, language: e.target.value})}>
                                        <option>English</option>
                                        <option>Urdu (اردو)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Base Currency</label>
                                        <select className="clay-input" value={regionData.currency} onChange={e => setRegionData({...regionData, currency: e.target.value})}>
                                            <option>PKR (Pakistani Rupee)</option>
                                            <option>USD (US Dollar)</option>
                                            <option>AED (Dirham)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>System Timezone</label>
                                        <select className="clay-input" value={regionData.timezone} onChange={e => setRegionData({...regionData, timezone: e.target.value})}>
                                            <option>Asia/Karachi (PKT)</option>
                                            <option>Asia/Dubai (GST)</option>
                                            <option>Europe/London (GMT)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="clay-card" style={{ background: '#fef2f2', border: 'none', boxShadow: 'none', marginTop: '2rem', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#991b1b' }}>
                                        <BellRing size={20} />
                                        <span style={{ fontWeight: 600 }}>Changing currency will re-calculate all past ledger archives instantly.</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="clay-button primary" style={{ height: '55px', padding: '0 2rem', fontSize: '1.1rem' }}><Save size={20} /> Apply Regional Settings</button>
                                </div>
                            </form>
                        </div>
                    )}
                    {/* NOTIFICATIONS TAB (User Only) */}
                    {activeTab === 'Notifications' && (
                        <div style={{ animation: 'slideRight 0.3s ease-out' }}>
                            <h3 style={{ marginBottom: '2.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><BellRing size={28} color="var(--primary)" /> Notification Center</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { id: 'orders', title: 'Order Updates', desc: 'Receive alerts when your order is shipped or delivered.' },
                                    { id: 'news', title: 'Seasonal Offers', desc: 'Get notified about limited-time fruit deals and discounts.' },
                                    { id: 'security', title: 'Security Alerts', desc: 'Receive important security and password change alerts.' }
                                ].map(n => (
                                    <div key={n.id} className="clay-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'none', background: 'var(--warm-bg)', border: 'none', padding: '1.5rem 2rem' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>{n.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.desc}</p>
                                        </div>
                                        <div 
                                            style={{ 
                                                width: '50px', height: '26px', borderRadius: '50px', background: notificationSettings[n.id] ? 'var(--primary)' : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                                            }}
                                            onClick={() => setNotificationSettings({ ...notificationSettings, [n.id]: !notificationSettings[n.id] })}
                                        >
                                            <div style={{ position: 'absolute', top: '3px', left: notificationSettings[n.id] ? '26px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="clay-button primary" onClick={() => alert('Notification settings saved!')}>Save Preferences</button>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default Settings;
