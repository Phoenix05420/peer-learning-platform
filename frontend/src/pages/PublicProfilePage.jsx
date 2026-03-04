import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await API.get(`/users/${userId}`);
                setProfileUser(data.user);
                setSkills(data.skills);
            } catch (err) {
                toast.error('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [userId]);

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    if (!profileUser) return (
        <div className="loading-screen">
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <p style={{ color: 'var(--text-secondary)' }}>User not found</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/feed')}>← Back to Feed</button>
            </div>
        </div>
    );

    const levelColors = { Basic: 'badge-info', Moderate: 'badge-warning', Mid: 'badge-warning', Advanced: 'badge-primary', Expert: 'badge-success' };

    return (
        <div className="page animate-fade" style={{ position: 'relative' }}>
            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                <button className="btn btn-ghost" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }} onClick={() => navigate('/feed')}>
                    ← Back to Feed
                </button>

                <div className="page-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="avatar avatar-xl" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}>
                            {profileUser.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>{profileUser.name}</h1>
                            {profileUser.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.6, marginTop: '0.5rem' }}>{profileUser.bio}</p>}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>🛠 Skills & Expertise</h2>
                    </div>

                    {skills.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <p>This user hasn't added any skills yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {skills.map(s => (
                                <div key={s._id} style={{ padding: '1.25rem', background: 'rgba(255,224,178,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{s.skillName}</span>
                                            <span className={`badge ${levelColors[s.level] || 'badge-info'}`}>{s.level}</span>
                                            <span className="badge badge-warning">{s.profession}</span>
                                            {s.mode === 'teach-learn' && <span className="badge badge-info">Teach & Learn</span>}
                                        </div>

                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span><strong>🗣 Language:</strong> {s.teachingLanguage}</span>
                                            {s.availableDates?.length > 0 && <span><strong>📅 Available:</strong> {s.availableDates.join(', ')}</span>}
                                        </div>

                                        {s.wantToLearn?.length > 0 && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <strong>📖 Wants to Learn:</strong> {s.wantToLearn.join(', ')}
                                            </div>
                                        )}

                                        {s.projects?.filter(p => p).length > 0 && (
                                            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Projects & Portfolio:</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    {s.projects.filter(p => p).map((p, i) => (
                                                        <a key={i} href={p} target="_blank" rel="noreferrer"
                                                            style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            🔗 {p}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
