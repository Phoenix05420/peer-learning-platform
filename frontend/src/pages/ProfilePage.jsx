import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import AddSkillModal from '../components/AddSkillModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', location: '', bio: '', currentPassword: '', newPassword: '' });
    const [mySkills, setMySkills] = useState([]);
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) setForm({ name: user.name || '', phone: user.phone || '', location: user.location || '', bio: user.bio || '', currentPassword: '', newPassword: '' });
        fetchSkills();
    }, [user]);

    const fetchSkills = async () => {
        try {
            const { data } = await API.get('/skills/my');
            setMySkills(data);
        } catch { }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await API.put('/users/me', form);
            updateUser({ ...user, ...data });
            setEditing(false);
            toast.success('Profile updated!');
        } catch { toast.error('Failed to update'); }
        finally { setSaving(false); }
    };

    const handleRemoveSkill = async (id) => {
        try {
            await API.delete(`/skills/${id}`);
            setMySkills(prev => prev.filter(s => s._id !== id));
            toast.success('Skill removed');
        } catch { toast.error('Failed to remove'); }
    };

    const levelColors = { Basic: 'badge-info', Moderate: 'badge-warning', Mid: 'badge-warning', Advanced: 'badge-primary', Expert: 'badge-success' };

    return (
        <div className="page animate-fade" style={{ position: 'relative' }}>
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-title">👤 My Profile</h1>
                        <p className="page-subtitle">Manage your personal details and skills</p>
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444', marginTop: '0.4rem' }} onClick={handleLogout}>🚪 Logout</button>
                </div>

                {/* Profile card */}
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div className="avatar avatar-xl">{user?.name?.[0]?.toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                            {!editing ? (
                                <>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{user?.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user?.email}</div>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {user?.phone && <span>📞 {user.phone}</span>}
                                        {user?.location && <span>📍 {user.location}</span>}
                                    </div>
                                    {user?.bio && <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{user.bio}</p>}
                                    <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                                </>
                            ) : (
                                <div style={{ width: '100%' }}>
                                    <div className="grid-2" style={{ marginBottom: '0' }}>
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid-2" style={{ marginBottom: '0' }}>
                                        <div className="form-group">
                                            <label className="form-label">Location</label>
                                            <input className="form-input" placeholder="City, State" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bio</label>
                                        <textarea className="form-input" rows={2} placeholder="Tell others about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: 'vertical' }} />
                                    </div>

                                    {/* Password Change Section */}
                                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Change Password (Optional)</h4>
                                        <div className="grid-2">
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">Current Password</label>
                                                <input className="form-input" type="password" placeholder="Leave blank to keep current" value={form.currentPassword || ''} onChange={e => setForm({ ...form, currentPassword: e.target.value })} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">New Password</label>
                                                <input className="form-input" type="password" placeholder="At least 6 characters" value={form.newPassword || ''} onChange={e => setForm({ ...form, newPassword: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '✅ Save'}</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills section */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🛠 My Skills ({mySkills.length})</h2>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddSkill(true)}>+ Add Skill</button>
                    </div>
                    {mySkills.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎭</div>
                            <p>No skills added yet. Add your first skill to appear in others' feeds!</p>

                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            {mySkills.map(s => (
                                <div key={s._id} style={{ padding: '1rem', background: 'rgba(255,224,178,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                                                <span style={{ fontWeight: 700 }}>{s.skillName}</span>
                                                <span className={`badge ${levelColors[s.level] || 'badge-info'}`}>{s.level}</span>
                                                <span className="badge badge-warning">{s.profession}</span>
                                                {s.mode === 'teach-learn' && <span className="badge badge-info">Teach & Learn</span>}
                                                {s.meetupOk && <span className="badge badge-success">📍 Meetup</span>}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                🗣 {s.teachingLanguage} · 📅 {s.availableDates?.slice(0, 3).join(', ') || 'No days set'}
                                                {s.wantToLearn?.length > 0 && <> · 📖 Learn: {s.wantToLearn.slice(0, 2).join(', ')}</>}
                                            </div>
                                            {s.projects?.filter(p => p).length > 0 && (
                                                <div style={{ marginTop: '0.3rem' }}>
                                                    {s.projects.filter(p => p).slice(0, 2).map((p, i) => (
                                                        <a key={i} href={p} target="_blank" rel="noreferrer"
                                                            style={{ fontSize: '0.72rem', color: 'var(--accent)', display: 'block', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            🔗 {p}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button className="btn btn-danger btn-xs" onClick={() => handleRemoveSkill(s._id)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showAddSkill && <AddSkillModal onClose={() => setShowAddSkill(false)} onAdded={fetchSkills} />}
        </div>
    );
}
