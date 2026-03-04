import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [tab, setTab] = useState('login');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', phone: '', location: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // OTP state for manual signups
    const [otpStep, setOtpStep] = useState(0); // 0 = form, 1 = enter OTP, 2 = verified
    const [otpValue, setOtpValue] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const startResendTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOTP = async () => {
        if (!signupData.email) return toast.error('Enter your email first');
        setOtpSending(true);
        try {
            const { data } = await API.post('/auth/send-otp', { email: signupData.email });
            if (data.devOtp) {
                setOtpValue(data.devOtp);
                toast.success('OTP auto-filled! (Dev mode) ✅');
            } else {
                toast.success('OTP sent to your email! 📧');
            }
            setOtpStep(1);
            startResendTimer();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally { setOtpSending(false); }
    };

    const handleVerifyOTP = async () => {
        if (otpValue.length !== 6) return toast.error('Enter the 6-digit code');
        setLoading(true);
        try {
            await API.post('/auth/verify-otp', { email: signupData.email, otp: otpValue });
            toast.success('Email verified! ✅');
            setOtpStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally { setLoading(false); }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/google', { token: credentialResponse.credential });
            login(data.token, data.user);
            toast.success(data.isAdmin ? 'Admin login successful!' : 'Welcome to PEERLearn! 🎉');
            navigate(data.isAdmin ? '/admin' : '/feed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google Auth failed');
        } finally { setLoading(false); }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) {
            return toast.error('Please fill in both email and password');
        }
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', loginData);
            login(data.token, data.user);
            toast.success(`Welcome back, ${data.user.name}!`);
            navigate(data.isAdmin ? '/admin' : '/feed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (otpStep < 2 && signupData.email !== 'admin@gmail.com') {
            return toast.error('Please verify your email first');
        }
        setLoading(true);
        try {
            const { data } = await API.post('/auth/signup', signupData);
            login(data.token, data.user);
            toast.success('Account created! Welcome 🎉');
            navigate('/feed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally { setLoading(false); }
    };

    const resetSignup = () => {
        setOtpStep(0);
        setOtpValue('');
        setResendTimer(0);
        setSignupData({ name: '', email: '', password: '', phone: '', location: '' });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🤝</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PEERLearn</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>Learn from each other, grow together</p>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', background: 'rgba(255,224,178,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                    {['login', 'signup'].map(t => (
                        <button key={t} onClick={() => { setTab(t); resetSignup(); }} style={{
                            flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            background: tab === t ? 'var(--gradient)' : 'transparent',
                            color: tab === t ? '#fff' : 'var(--text-secondary)',
                            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem',
                            transition: 'all 0.3s ease'
                        }}>
                            {t === 'login' ? '🔑 Login' : '✨ Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Login Form */}
                {tab === 'login' && (
                    <form className="glass-card animate-fade" style={{ padding: '2rem' }} onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" placeholder="you@example.com" required
                                value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder="••••••••" required
                                value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
                        </div>
                        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : '🚀 Sign In'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            <span style={{ padding: '0 10px' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Sign-In failed')}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No account? <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setTab('signup'); resetSignup(); }}>Sign up free</span>
                        </p>
                    </form>
                )}

                {/* Signup Form */}
                {tab === 'signup' && (
                    <form className="glass-card animate-fade" style={{ padding: '2rem' }} onSubmit={handleSignup}>

                        {/* Step indicator */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
                            {[0, 1, 2].map(s => (
                                <div key={s} style={{
                                    height: '4px', flex: 1, borderRadius: '2px',
                                    background: otpStep >= s ? 'var(--accent)' : 'var(--border)',
                                    transition: 'background 0.3s'
                                }} />
                            ))}
                        </div>

                        {/* Email + OTP verification */}
                        <div className="form-group">
                            <label className="form-label">Email Address * {otpStep === 2 && <span className="badge badge-success" style={{ marginLeft: '0.4rem' }}>✅ Verified</span>}</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input className="form-input" type="email" placeholder="you@example.com" required
                                    value={signupData.email}
                                    onChange={e => { setSignupData({ ...signupData, email: e.target.value }); if (otpStep > 0) resetSignup(); }}
                                    disabled={otpStep === 2}
                                    style={{ flex: 1 }} />
                                {otpStep < 2 && (
                                    <button type="button" className="btn btn-primary btn-sm"
                                        onClick={handleSendOTP} disabled={otpSending || !signupData.email || resendTimer > 0}
                                        style={{ whiteSpace: 'nowrap', minWidth: '110px' }}>
                                        {otpSending ? '📧...' : otpStep === 0 ? '📧 Send OTP' : `Resend ${resendTimer > 0 ? `(${resendTimer}s)` : ''}`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* OTP Input */}
                        {otpStep === 1 && (
                            <div className="form-group animate-fade" style={{ background: 'rgba(255,111,0,0.08)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid rgba(255,111,0,0.2)' }}>
                                <label className="form-label" style={{ color: 'var(--accent)' }}>🔐 Enter 6-digit OTP</label>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.6rem' }}>We sent a code to {signupData.email}</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input className="form-input" placeholder="123456" maxLength={6}
                                        value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                        style={{ flex: 1, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '6px', textAlign: 'center' }} />
                                    <button type="button" className="btn btn-primary btn-sm" onClick={handleVerifyOTP} disabled={loading || otpValue.length !== 6}>
                                        {loading ? '...' : '✅ Verify'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Rest of signup fields (show after verification or for admin) */}
                        {(otpStep === 2 || signupData.email === 'admin@gmail.com') && (
                            <div className="animate-fade">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input className="form-input" placeholder="Your name" required
                                            value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" placeholder="+91 9876..." type="tel"
                                            value={signupData.phone} onChange={e => setSignupData({ ...signupData, phone: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password *</label>
                                    <input className="form-input" type="password" placeholder="At least 6 characters" required minLength={6}
                                        value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                                    <input className="form-input" placeholder="City, State"
                                        value={signupData.location} onChange={e => setSignupData({ ...signupData, location: e.target.value })} />
                                </div>
                                <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                                    {loading ? 'Creating account...' : '✨ Create Account'}
                                </button>
                            </div>
                        )}

                        {/* Show a message when email not yet verified */}
                        {otpStep === 0 && signupData.email !== 'admin@gmail.com' && (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                📧 Enter your email and click <strong style={{ color: 'var(--accent)' }}>Send OTP</strong> to verify it first
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            <span style={{ padding: '0 10px' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Sign-In failed')}
                                theme="filled_black"
                                shape="pill"
                                text="signup_with"
                            />
                        </div>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Already have an account? <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setTab('login')}>Sign in</span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
