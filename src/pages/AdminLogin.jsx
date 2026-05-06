import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import api from '../api/axios';

const AdminLogin = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/admin/login', {
                email: formData.email,
                password: formData.password
            });

            onLogin({
                token: data.token,
                role: data.role,
                name: data.username,
                _id: data._id
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Match the site theme (same backdrop style as user login) */}
            <div className="hero-bg-anim" style={{ zIndex: 1, opacity: 0.3 }}></div>
            <div className="login-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 2 }}></div>

            <div className="clay-card" style={{ maxWidth: '450px', width: '90%', zIndex: 10, padding: '3rem', position: 'relative' }}>
                <button
                    type="button"
                    className="clay-button"
                    style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', justifyContent: 'center' }}
                    onClick={() => navigate('/')}
                    title="Back to Home"
                >
                    <ArrowLeft />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="logo-icon" style={{ margin: '0 auto 1.5rem', background: 'var(--primary)' }}>
                        <Lock color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Admin Portal
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Secure access for Javed and Sons administrators
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Admin Email</label>
                        <input
                            type="email"
                            className="clay-input"
                            placeholder="admin@javedsons.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Secret Password</label>
                        <input
                            type="password"
                            className="clay-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="clay-button" style={{ 
                        width: '100%', 
                        height: '60px', 
                        fontSize: '1.1rem', 
                        justifyContent: 'center', 
                        opacity: loading ? 0.7 : 1,
                        background: 'var(--primary)',
                        color: 'white',
                        boxShadow: 'var(--clay-shadow-puffy)'
                    }}>
                        {loading ? 'Verifying...' : <><ShieldCheck /> Authorize Access</>}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Unauthorized access attempts are logged and monitored.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
