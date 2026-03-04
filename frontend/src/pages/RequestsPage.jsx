import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import toast from 'react-hot-toast';

function RequestCard({ request, onAccept, onReject, type }) {
    const { user } = useAuth();
    const isInbox = type === 'inbox';
    const other = isInbox ? request.fromUser : request.toUser;

    const statusBadge = {
        pending: <span className="badge badge-warning">⏳ Pending</span>,
        accepted: <span className="badge badge-success">✅ Accepted</span>,
        rejected: <span className="badge badge-danger">❌ Rejected</span>,
    }[request.status];

    return (
        <div className="glass-card animate-fade" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                <div className="avatar avatar-md">{other?.name?.[0]?.toUpperCase() || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{other?.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{other?.email}</div>
                        </div>
                        {statusBadge}
                    </div>

                    {request.skill && (
                        <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span className="badge badge-primary">🛠 {request.skill.skillName}</span>
                            <span className="badge badge-info">{request.skill.level}</span>
                        </div>
                    )}

                    {request.message && (
                        <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,224,178,0.04)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            "{request.message}"
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                        {isInbox && request.status === 'pending' && (
                            <>
                                <button className="btn btn-primary btn-sm" onClick={() => onAccept(request._id)}>✅ Accept</button>
                                <button className="btn btn-danger btn-sm" onClick={() => onReject(request._id)}>✕ Reject</button>
                            </>
                        )}
                        {request.status === 'accepted' && (
                            <button className="btn btn-outline btn-sm" onClick={() => onAccept(request._id, 'chat')}>💬 Open Chat</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RequestsPage() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('inbox');

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await API.get('/requests');
            setRequests(data);
        } catch { toast.error('Failed to load requests'); }
        finally { setLoading(false); }
    };

    const handleAccept = async (id, action) => {
        if (action === 'chat') return navigate(`/chat/${id}`);
        try {
            await API.put(`/requests/${id}`, { status: 'accepted' });
            toast.success('Request accepted! You can now chat 🎉');
            fetchRequests();
        } catch { toast.error('Failed to accept'); }
    };

    const handleReject = async (id) => {
        try {
            await API.put(`/requests/${id}`, { status: 'rejected' });
            toast.success('Request rejected');
            fetchRequests();
        } catch { toast.error('Failed to reject'); }
    };

    const inbox = requests.filter(r => r.toUser?._id === (JSON.parse(localStorage.getItem('peer_user') || '{}')._id));
    const sent = requests.filter(r => r.fromUser?._id === (JSON.parse(localStorage.getItem('peer_user') || '{}')._id));

    const display = tab === 'inbox' ? inbox : sent;

    return (
        <div className="page animate-fade" style={{ position: 'relative' }}>
            <div className="bg-orb bg-orb-1" />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="page-header">
                    <h1 className="page-title">📩 Requests</h1>
                    <p className="page-subtitle">Manage your incoming and outgoing connection requests</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,224,178,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem', border: '1px solid var(--border)', maxWidth: '340px' }}>
                    {[
                        { key: 'inbox', label: `📥 Inbox (${inbox.length})` },
                        { key: 'sent', label: `📤 Sent (${sent.length})` }
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            flex: 1, padding: '0.55rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            background: tab === t.key ? 'var(--gradient)' : 'transparent',
                            color: tab === t.key ? '#fff' : 'var(--text-secondary)',
                            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                            transition: 'all 0.3s'
                        }}>{t.label}</button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
                        <div className="spinner" />
                    </div>
                ) : display.length === 0 ? (
                    <div className="glass-card flex-center" style={{ minHeight: '250px', flexDirection: 'column', gap: '1rem', padding: '3rem' }}>
                        <div style={{ fontSize: '3rem' }}>📭</div>
                        <div style={{ fontWeight: 700 }}>No {tab} requests</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            {tab === 'inbox' ? 'No one has sent you a request yet.' : 'You haven\'t sent any requests yet.'}
                        </p>
                        {tab === 'sent' && <button className="btn btn-primary" onClick={() => navigate('/feed')}>Browse Feed</button>}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {display.map(r => (
                            <RequestCard key={r._id} request={r} type={tab} onAccept={handleAccept} onReject={handleReject} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
