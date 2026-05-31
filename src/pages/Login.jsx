import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, UserPlus, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const Login = ({ onLogin }) => {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === 'register') {
                const { data } = await api.post('/auth/register', {
                    username: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                });
                onLogin({
                    token: data.token,
                    role: data.role,
                    name: data.username,
                    email: data.email,
                    phone: data.phone,
                    profileImage: data.profileImage,
                    _id: data._id
                });
            } else {
                const { data } = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                onLogin({
                    token: data.token,
                    role: data.role,
                    name: data.username,
                    email: data.email,
                    phone: data.phone,
                    profileImage: data.profileImage,
                    _id: data._id
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Background elements omitted for brevity, keeping existing ones in file */}
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
                        <Leaf color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {mode === 'login' ? 'Member Login' : 'Join Our Store'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {mode === 'login' ? 'Welcome back to Javed & Sons Store' : 'Create an account to start shopping'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        className={`clay-button ${mode === 'login' ? 'active' : ''}`}
                        style={{ flex: 1, background: mode === 'login' ? 'var(--primary)' : 'var(--white)', color: mode === 'login' ? 'white' : 'var(--text-main)' }}
                        onClick={() => setMode('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`clay-button ${mode === 'register' ? 'active' : ''}`}
                        style={{ flex: 1, background: mode === 'register' ? 'var(--primary)' : 'var(--white)', color: mode === 'register' ? 'white' : 'var(--text-main)' }}
                        onClick={() => setMode('register')}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                    {mode === 'register' && (
                        <>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                                <input
                                    type="text"
                                    className="clay-input"
                                    placeholder="e.g. Ali Khan"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                                <input
                                    type="text"
                                    className="clay-input"
                                    placeholder="03xx-xxxxxxx"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    )}
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            type="email"
                            className="clay-input"
                            placeholder="mail@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            className="clay-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="clay-button primary" style={{ width: '100%', height: '60px', fontSize: '1.1rem', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Processing...' : (mode === 'login' ? <><ShieldCheck /> Sign In</> : <><UserPlus /> Sign Up</>)}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
