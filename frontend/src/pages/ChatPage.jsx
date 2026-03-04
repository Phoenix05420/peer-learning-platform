import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

export default function ChatPage() {
    const { requestId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBase64, setAudioBase64] = useState(null);
    const bottomRef = useRef(null);
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const other = request
        ? (request.fromUser?._id === user?._id ? request.toUser : request.fromUser)
        : null;

    useEffect(() => {
        fetchData();
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_request', requestId);
        socketRef.current.on('receive_message', (msg) => {
            setMessages(prev => {
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        });
        return () => socketRef.current?.disconnect();
    }, [requestId]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const fetchData = async () => {
        try {
            const [reqRes, msgRes] = await Promise.all([
                API.get(`/requests`),
                API.get(`/messages/${requestId}`)
            ]);
            const req = reqRes.data.find(r => r._id === requestId);
            setRequest(req);
            setMessages(msgRes.data);
        } catch { toast.error('Failed to load chat'); }
        finally { setLoading(false); }
    };

    const recordingStartTimeRef = useRef(0);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            recordingStartTimeRef.current = Date.now();
            const chunks = [];

            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const duration = Date.now() - recordingStartTimeRef.current;

                // If the recording was less than half a second, discard it (accidental tap)
                if (duration < 500 || chunks.length === 0) {
                    return;
                }

                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    // Send instantly like WhatsApp
                    sendAudioMessage(reader.result);
                };
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            toast.error('Microphone access denied or unsupported');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const sendAudioMessage = async (base64) => {
        setSending(true);
        try {
            const { data } = await API.post(`/messages/${requestId}`, { audioData: base64 });
            socketRef.current?.emit('send_message', { ...data, requestId });
            setMessages(prev => [...prev, data]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send audio');
        } finally { setSending(false); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        try {
            const { data } = await API.post(`/messages/${requestId}`, { text });
            socketRef.current?.emit('send_message', { ...data, requestId });
            setMessages(prev => [...prev, data]);
            setText('');
            setShowEmoji(false);

            // Reset textarea height after sending
            const textarea = document.getElementById('chat-textarea');
            if (textarea) textarea.style.height = '46px';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send');
        } finally { setSending(false); }
    };

    if (loading) return (
        <div className="loading-screen"><div className="spinner" /></div>
    );

    if (!request) return (
        <div className="loading-screen">
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>⚠️</div>
                <p style={{ color: 'var(--text-secondary)' }}>Chat not found or not accessible</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/requests')}>← Back</button>
            </div>
        </div>
    );

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="bg-orb bg-orb-1" />
            {/* Chat header */}
            <div style={{ background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10, position: 'relative' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => navigate('/requests')}>←</button>
                {other && <div className="avatar avatar-md">{other.name[0].toUpperCase()}</div>}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{other?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {request.skill?.skillName && `📚 ${request.skill.skillName}`}
                    </div>
                </div>
                {/* Contact info */}
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {other?.phone && <div>📞 {other.phone}</div>}
                    <div>✉ {other?.email}</div>
                </div>
            </div>



            {/* Messages area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                {messages.length === 0 && (
                    <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem' }}>👋</div>
                        <p style={{ fontWeight: 600 }}>Start the conversation!</p>
                        <p style={{ fontSize: '0.83rem' }}>Say hi to {other?.name} and plan your learning session</p>
                    </div>
                )}
                {messages.map(m => {
                    const isMine = m.sender?._id === user?._id;
                    return (
                        <div key={m._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: '0.5rem', alignItems: 'flex-end' }}>
                            {!isMine && <div className="avatar avatar-sm">{m.sender?.name?.[0]?.toUpperCase()}</div>}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                {m.text && (
                                    <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}
                                        style={{ position: 'relative', display: 'inline-block', padding: '0.6rem 0.8rem', paddingRight: '4.5rem', textAlign: 'left', minWidth: '80px', maxWidth: '100%' }}>
                                        <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{m.text}</span>
                                        <span style={{ fontSize: '0.65rem', position: 'absolute', bottom: '0.35rem', right: '0.7rem', opacity: 0.8, whiteSpace: 'nowrap' }}>
                                            {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                                {m.audioData && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                        <audio src={m.audioData} controls style={{ marginTop: '0.3rem', maxWidth: '220px', height: '35px', borderRadius: '20px' }} />
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
                                            {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {isMine && <div className="avatar avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div style={{ position: 'relative', zIndex: 12 }}>
                {showEmoji && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '1rem', paddingBottom: '0.5rem' }}>
                        <EmojiPicker theme="dark" onEmojiClick={(e) => setText(prev => prev + e.emoji)} />
                    </div>
                )}



                <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', background: 'rgba(13,13,26,0.95)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0 }}>😊</button>

                    <textarea
                        id="chat-textarea"
                        className="form-input"
                        style={{ flex: 1, borderRadius: '23px', minHeight: '46px', maxHeight: '120px', padding: '0.75rem 1.25rem', margin: 0, resize: 'none', overflowY: 'auto', lineHeight: '1.4', boxSizing: 'border-box' }}
                        placeholder={`Message ${other?.name}...`}
                        value={text}
                        rows={1}
                        onChange={e => {
                            setText(e.target.value);
                            e.target.style.height = '46px';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    />

                    {text.trim() === '' ? (
                        <button
                            type="button"
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            style={{ background: isRecording ? '#ef4444' : 'var(--bg-card-hover)', border: '1px solid var(--border)', width: '46px', height: '46px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.2s', flexShrink: 0, padding: 0 }}
                        >
                            🎤
                        </button>
                    ) : (
                        <button className="btn btn-primary" type="submit" disabled={sending} style={{ borderRadius: '50px', minWidth: '80px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '0 1.5rem', margin: 0 }}>
                            {sending ? '...' : '➤'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
