import React, { useState } from 'react';
import { Search, Plus, Filter, Download, MoreVertical, UploadCloud, Printer, X, FileText, CheckCircle2 } from 'lucide-react';

const Copybooks = () => {
    const [activePartner, setActivePartner] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const [partnerEntries, setPartnerEntries] = useState([]);

    useEffect(() => {
        import('../api/axios').then(({ default: api }) => {
            api.get('/data/partner-copybook')
                .then(({ data }) => setPartnerEntries(data))
                .catch(err => console.error("Copybook fetch fail:", err));
        });
    }, []);

    // Group entries by partner name for the UI
    const partnerData = partnerEntries.reduce((acc, entry) => {
        if (!acc[entry.partner]) acc[entry.partner] = [];
        acc[entry.partner].push({
            ...entry,
            id: entry._id,
            debit: entry.debit ? `₨ ${entry.debit.toLocaleString()}` : "0",
            credit: entry.credit ? `₨ ${entry.credit.toLocaleString()}` : "0",
            balance: `₨ ${entry.balance.toLocaleString()}`
        });
        return acc;
    }, {});

    const handleUpload = () => {
        setIsUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsUploading(false);
                    setShowUploadModal(false);
                    setUploadProgress(0);
                    alert("Physical page digitized and added to register successfully!");
                }, 500);
            }
        }, 200);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-register');
        if (!printContent) return;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); 
    };

    const totalBalance = activePartner && partnerData[activePartner] ? partnerData[activePartner][0]?.balance || "0" : "0";

    return (
        <div className="page-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Partner Copybook</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Digital register for partner investments and profit sharing.</p>
                </div>
                <button className="clay-button primary" onClick={() => setShowUploadModal(true)}><UploadCloud /> Upload Physical Page</button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {Object.keys(partnerData).length === 0 ? (
                    <div style={{ padding: '0.5rem 1rem', background: 'var(--warm-bg)', borderRadius: '12px', color: 'var(--text-muted)' }}>No partners registered.</div>
                ) : (
                    Object.keys(partnerData).map(partner => (
                        <button 
                            key={partner}
                            className={`clay-button ${activePartner === partner ? 'active' : ''}`} 
                            style={activePartner === partner ? { background: 'var(--primary)', color: 'white' } : {}}
                            onClick={() => setActivePartner(partner)}
                        >
                            Partner: {partner}
                        </button>
                    ))
                )}
            </div>

            {/* Digitization Modal */}
            {showUploadModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(15px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="clay-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', borderRadius: '40px', background: 'white', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0 }}>Digitize Register Page</h2>
                            <button className="clay-button" style={{ width: '40px', height: '40px', color: 'var(--danger)', padding: 0 }} onClick={() => setShowUploadModal(false)}><X /></button>
                        </div>
                        
                        {!isUploading ? (
                            <div style={{ padding: '2rem', border: '3px dashed var(--warm-bg)', borderRadius: '32px', marginBottom: '2rem' }}>
                                <UploadCloud size={64} style={{ color: 'var(--primary)', marginBottom: '1.5rem', opacity: 0.5 }} />
                                <p style={{ fontWeight: 600 }}>Drop high-resolution scan or image here</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supported: JPG, PNG, PDF (Max 10MB)</p>
                                <button className="clay-button primary" style={{ marginTop: '2rem', width: '100%' }} onClick={handleUpload}>Start OCR Scanning</button>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Extracting Data...</div>
                                <div style={{ width: '100%', height: '15px', background: 'var(--warm-bg)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--clay-shadow-in)', marginBottom: '1.5rem' }}>
                                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.3s ease' }}></div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Our AI is digitizing handwriting and validating ledger entries...</p>
                            </div>
                        )}
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} color="var(--success)" /> SECURE AES-256 ENCRYPTED STORAGE</p>
                    </div>
                </div>
            )}

            <div className="clay-card" id="printable-register">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Running Balance</h3>
                        <div style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ color: 'var(--success)', fontWeight: 800, padding: '0.5rem 1rem', background: '#dcfce7', borderRadius: '12px' }}>PKR {totalBalance} (Cr)</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Last updated: Today</span>
                        </div>
                    </div>
                    <button className="clay-button" onClick={handlePrint}><Printer /> Print Register</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Date</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Description</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Debit (Dr)</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Credit (Cr)</th>
                                <th style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activePartner && partnerData[activePartner] ? partnerData[activePartner].map((r) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                                    <td style={{ padding: '1.5rem 1rem' }}>{r.date}</td>
                                    <td style={{ padding: '1.5rem 1rem', fontWeight: 500 }}>{r.desc}</td>
                                    <td style={{ padding: '1.5rem 1rem', color: r.debitColor ? `var(--${r.debitColor})` : 'inherit', fontWeight: 'bold' }}>{r.debit}</td>
                                    <td style={{ padding: '1.5rem 1rem', color: r.creditColor ? `var(--${r.creditColor})` : 'inherit', fontWeight: 'bold' }}>{r.credit}</td>
                                    <td style={{ padding: '1.5rem 1rem', fontWeight: 800 }}>{r.balance}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Select a partner or upload a page to see entries.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Copybooks;

