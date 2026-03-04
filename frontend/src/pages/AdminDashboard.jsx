import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                API.get('/admin/users'),
                API.get('/admin/stats')
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        } finally { setLoading(false); }
    };

    const handleDelete = async (userId, userName) => {
        if (!confirm(`Remove user "${userName}"? They will be deactivated.`)) return;
        setDeleting(userId);
        try {
            await API.delete(`/admin/users/${userId}`);
            toast.success('User deactivated');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove user');
        } finally { setDeleting(null); }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading admin data...</p>
        </div>
    );

    return (
        <div className="page animate-fade" style={{ position: 'relative' }}>
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '2rem' }}>⚙️</span>
                            <h1 className="page-title">Admin Dashboard</h1>
                        </div>
                        <p className="page-subtitle">Manage users and monitor platform activity</p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid-4" style={{ marginBottom: '2rem' }}>
                        {[
                            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                            { label: 'Active Users', value: stats.activeUsers, icon: '✅' },
                            { label: 'Skills Listed', value: stats.totalSkills, icon: '🛠️' },
                            { label: 'Connections', value: stats.acceptedRequests, icon: '🤝' },
                        ].map(s => (
                            <div key={s.label} className="glass-card stat-card">
                                <div style={{ fontSize: '1.75rem' }}>{s.icon}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className="search-bar" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                    <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {/* Users Table */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Registered Users ({filtered.length})</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['User', 'Email', 'Location', 'Joined', 'Skills', 'Requests', 'Connections', 'Status', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.filter(u => !u.isAdmin).map((u, i) => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,224,178,0.02)' }}>
                                        <td style={{ padding: '0.9rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div className="avatar avatar-sm">{u.name[0].toUpperCase()}</div>
                                                <span style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{u.location || '—'}</td>
                                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                                            <span className="badge badge-primary">{u.activity.skillCount}</span>
                                        </td>
                                        <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                ↑{u.activity.requestsSent} ↓{u.activity.requestsReceived}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                                            <span className="badge badge-success">{u.activity.acceptedConnections}</span>
                                        </td>
                                        <td style={{ padding: '0.9rem 1rem' }}>
                                            <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.9rem 1rem' }}>
                                            {u.isActive ? (
                                                <button className="btn btn-danger btn-xs" onClick={() => handleDelete(u._id, u.name)} disabled={deleting === u._id}>
                                                    {deleting === u._id ? '...' : '🗑 Remove'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Removed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.filter(u => !u.isAdmin).length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
                                <p>No users found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
