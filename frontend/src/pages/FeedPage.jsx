import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import AddSkillModal from '../components/AddSkillModal';
import toast from 'react-hot-toast';

const SKILLS_LIST = [
    'React', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Node.js', 'Express',
    'MongoDB', 'SQL', 'Python', 'Java', 'Advanced Java', 'Spring Boot',
    'Django', 'Flutter', 'Android', 'iOS (Swift)', 'PHP', 'Laravel',
    'Vue.js', 'Angular', 'Next.js', 'GraphQL', 'Docker', 'Kubernetes',
    'AWS', 'Firebase', 'Machine Learning', 'Data Science', 'C++', 'C#',
    'Unity', 'Figma / UI-UX', 'Digital Marketing', 'Excel / Data Analysis'
];
const LEVELS = ['Basic', 'Moderate', 'Mid', 'Advanced', 'Expert'];
const PROFESSIONS = ['Student', 'Teacher', 'Developer', 'Freelancer', 'Other'];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function UserCard({ userData, onRequest }) {
    const { user: me } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const { user, skills } = userData;
    const mainSkill = skills[0];

    const levelColor = { Basic: 'badge-info', Moderate: 'badge-warning', Mid: 'badge-warning', Advanced: 'badge-primary', Expert: 'badge-success' };

    return (
        <div className="glass-card animate-fade hover-scale" onClick={() => navigate(`/user/${user._id}`)} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
            {/* User header */}
            <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                <div className="avatar avatar-md">{user.name[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{user.name}</div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {user.location && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {user.location}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {mainSkill && <span className="badge badge-primary">{mainSkill.skillName}</span>}
                        {mainSkill && <span className={`badge ${levelColor[mainSkill.level] || 'badge-info'}`}>{mainSkill.level}</span>}
                        {mainSkill?.meetupOk && <span className="badge badge-success">📍 Meetup OK</span>}
                    </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{skills.length} skill{skills.length !== 1 ? 's' : ''}</div>
                </div>
            </div>

            {/* Main skill details */}
            {mainSkill && (
                <div style={{ background: 'rgba(255,224,178,0.04)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>👤 {mainSkill.profession}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>🗣 {mainSkill.teachingLanguage}</span>
                        {mainSkill.mode === 'teach-learn' && <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Teach & Learn</span>}
                    </div>
                    {mainSkill.availableDates?.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            📅 {mainSkill.availableDates.slice(0, 3).join(', ')}{mainSkill.availableDates.length > 3 ? ` +${mainSkill.availableDates.length - 3}` : ''}
                        </div>
                    )}
                    {mainSkill.projects?.filter(p => p).length > 0 && (
                        <div style={{ marginTop: '0.4rem' }}>
                            {mainSkill.projects.filter(p => p).slice(0, 2).map((p, i) => (
                                <a key={i} href={p} target="_blank" rel="noreferrer"
                                    style={{ fontSize: '0.72rem', color: 'var(--accent)', display: 'block', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    🔗 {p}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* All skills (expandable) */}
            {skills.length > 1 && (
                <div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                        {expanded ? '▲ Hide' : `▼ Show all ${skills.length} skills`}
                    </button>
                    {expanded && (
                        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {skills.slice(1).map(s => (
                                <div key={s._id} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{s.skillName}</span>
                                    <span className={`badge ${levelColor[s.level] || 'badge-info'}`}>{s.level}</span>
                                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{s.profession}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Action */}
            <button className="btn btn-primary btn-sm w-full" onClick={(e) => { e.stopPropagation(); onRequest(userData); }}>
                📩 Send Request
            </button>
        </div>
    );
}

function FilterPanel({ filters, setFilters, onApply, onReset }) {
    const [local, setLocal] = useState(filters);
    return (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>🎚 Filters</div>

            <div className="form-group">
                <label className="form-label">Skill</label>
                <select className="form-input" value={local.skill} onChange={e => setLocal({ ...local, skill: e.target.value })}>
                    <option value="">All Skills</option>
                    {SKILLS_LIST.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Level</label>
                <select className="form-input" value={local.level} onChange={e => setLocal({ ...local, level: e.target.value })}>
                    <option value="">Any Level</option>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-input" value={local.language} onChange={e => setLocal({ ...local, language: e.target.value })}>
                    <option value="">Any Language</option>
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Profession</label>
                <select className="form-input" value={local.profession} onChange={e => setLocal({ ...local, profession: e.target.value })}>
                    <option value="">Any Profession</option>
                    {PROFESSIONS.map(p => <option key={p}>{p}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Teaching Mode</label>
                <select className="form-input" value={local.mode} onChange={e => setLocal({ ...local, mode: e.target.value })}>
                    <option value="">Any Mode</option>
                    <option value="teach-only">Teach Only</option>
                    <option value="teach-learn">Teach & Learn</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Day Availability</label>
                <select className="form-input" value={local.date} onChange={e => setLocal({ ...local, date: e.target.value })}>
                    <option value="">Any Day</option>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <input type="checkbox" id="meetup-f" checked={local.meetup === 'true'} onChange={e => setLocal({ ...local, meetup: e.target.checked ? 'true' : '' })} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                <label htmlFor="meetup-f" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Meetup OK only</label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setFilters(local); onApply(local); }}>Apply</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { const reset = { skill: '', level: '', language: '', profession: '', mode: '', date: '', meetup: '' }; setLocal(reset); setFilters(reset); onApply(reset); }}>Reset</button>
            </div>
        </div>
    );
}

function RequestModal({ userData, onClose, onSubmit }) {
    const [message, setMessage] = useState('');
    const [selectedSkill, setSelectedSkill] = useState(userData.skills[0]?._id || '');
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box animate-slide">
                <h2 className="modal-title">📩 Send Request to {userData.user.name}</h2>
                <div className="form-group">
                    <label className="form-label">For which skill?</label>
                    <select className="form-input" value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
                        {userData.skills.map(s => <option key={s._id} value={s._id}>{s.skillName} ({s.level})</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Message (optional)</label>
                    <textarea className="form-input" rows={3} placeholder="Hi! I'm interested in learning from you..."
                        value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onSubmit(userData.user._id, selectedSkill, message)}>Send Request</button>
                </div>
            </div>
        </div>
    );
}

export default function FeedPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ skill: '', level: '', language: '', profession: '', mode: '', date: '', meetup: '' });
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [requestTarget, setRequestTarget] = useState(null);
    const [mySkills, setMySkills] = useState([]);

    useEffect(() => { fetchFeed(filters); fetchMySkills(); }, []);

    const fetchFeed = async (f = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
            if (search) params.set('search', search);
            const { data } = await API.get(`/users/feed?${params}`);
            setFeed(data);
        } catch (err) {
            toast.error('Failed to load feed');
        } finally { setLoading(false); }
    };

    const fetchMySkills = async () => {
        try {
            const { data } = await API.get('/skills/my');
            setMySkills(data);
        } catch { }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFeed(filters);
    };

    const handleSendRequest = async (toUserId, skillId, message) => {
        try {
            await API.post('/requests', { toUser: toUserId, skill: skillId, message });
            toast.success('Request sent! 🎉');
            setRequestTarget(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="page animate-fade" style={{ position: 'relative' }}>
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="page-header">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 className="page-title">👋 Hey, {user?.name?.split(' ')[0]}!</h1>
                            <p className="page-subtitle">Discover people to learn from or teach</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {mySkills.length === 0 && (
                                <div style={{ background: 'rgba(255,111,0,0.1)', border: '1px solid rgba(255,111,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.83rem', color: 'var(--accent)' }}>
                                    ⚠️ Add a skill to appear in others' feeds
                                </div>
                            )}
                            
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>📩 Requests</button>
                        </div>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} style={{ marginTop: '1.5rem' }}>
                        <div className="search-bar">
                            <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                            <input placeholder="Search by skill, name, or location..." value={search} onChange={e => setSearch(e.target.value)} />
                            <button type="submit" className="btn btn-primary btn-sm">Search</button>
                        </div>
                    </form>
                </div>

                {/* My Skills bar */}
                {mySkills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.3rem' }}>My Skills:</span>
                        {mySkills.map(s => (
                            <span key={s._id} className="badge badge-primary">{s.skillName} • {s.level}</span>
                        ))}
                        <button className="btn btn-ghost btn-xs" onClick={() => setShowAddSkill(true)}>+ Add More</button>
                    </div>
                )}

                {/* Layout: filter sidebar + feed */}
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    <div style={{ position: 'sticky', top: '80px' }}>
                        <FilterPanel filters={filters} setFilters={setFilters} onApply={fetchFeed} />
                    </div>
                    <div>
                        {loading ? (
                            <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
                                <div className="spinner" />
                                <p style={{ color: 'var(--text-secondary)' }}>Finding your peers...</p>
                            </div>
                        ) : feed.length === 0 ? (
                            <div className="glass-card flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem', padding: '3rem' }}>
                                <div style={{ fontSize: '3.5rem' }}>🌐</div>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>No peers found</div>
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Try adjusting your filters or be the first to add your skills!</p>
                                <button className="btn btn-primary" onClick={() => setShowAddSkill(true)}>Add Your First Skill</button>
                            </div>
                        ) : (
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{feed.length} peer{feed.length !== 1 ? 's' : ''} found</p>
                                <div className="grid-3">
                                    {feed.map(ud => (
                                        <UserCard key={ud.user._id} userData={ud} onRequest={setRequestTarget} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAddSkill && <AddSkillModal onClose={() => setShowAddSkill(false)} onAdded={() => { fetchFeed(); fetchMySkills(); }} />}
            {requestTarget && <RequestModal userData={requestTarget} onClose={() => setRequestTarget(null)} onSubmit={handleSendRequest} />}
        </div>
    );
}
