import { useState } from 'react';
import API from '../api/api';
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
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Other'];
const TIMES = ['6:00 AM – 8:00 AM', '8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM', '6:00 PM – 8:00 PM', '8:00 PM – 10:00 PM'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function MultiToggle({ options, selected, onChange, label }) {
    return (
        <div>
            {label && <div className="form-label" style={{ marginBottom: '0.5rem' }}>{label}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {options.map(o => (
                    <button key={o} type="button"
                        className={`skill-chip${selected.includes(o) ? ' selected' : ''}`}
                        onClick={() => onChange(selected.includes(o) ? selected.filter(s => s !== o) : [...selected, o])}>
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

function SingleToggle({ options, value, onChange, label }) {
    return (
        <div>
            {label && <div className="form-label" style={{ marginBottom: '0.5rem' }}>{label}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {options.map(o => (
                    <button key={o} type="button"
                        className={`skill-chip${value === o ? ' selected' : ''}`}
                        onClick={() => onChange(o)}>
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function AddSkillModal({ onClose, onAdded }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        skillName: '', level: '', profession: '',
        projects: [''], teachingLanguage: '',
        availableDates: [], availableTimes: [],
        meetupOk: false, mode: 'teach-only', wantToLearn: []
    });
    const [loading, setLoading] = useState(false);

    const next = () => setStep(s => s + 1);
    const prev = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = { ...form, projects: form.projects.filter(p => p.trim()) };
            await API.post('/skills', payload);
            toast.success('Skill added successfully! 🎉');
            onAdded?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add skill');
        } finally { setLoading(false); }
    };

    const isStep1Valid = form.skillName && form.level && form.profession;
    const isStep2Valid = form.teachingLanguage;
    const isStep3Valid = form.availableDates.length > 0;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box animate-slide">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 className="modal-title" style={{ margin: 0 }}>🛠 Add a Skill</h2>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} style={{
                                    height: '4px', flex: 1, borderRadius: '2px',
                                    background: step >= s ? 'var(--accent)' : 'var(--border)',
                                    transition: 'background 0.3s'
                                }} />
                            ))}
                        </div>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={onClose}>✕</button>
                </div>

                {/* Step 1: Skill Selection */}
                {step === 1 && (
                    <div className="animate-fade">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Step 1 of 4 — Choose your skill and expertise</p>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div className="form-label" style={{ marginBottom: '0.75rem' }}>Select Skill *</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                {SKILLS_LIST.map(s => (
                                    <button key={s} type="button"
                                        className={`skill-chip${form.skillName === s ? ' selected' : ''}`}
                                        onClick={() => setForm({ ...form, skillName: s })}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}><SingleToggle options={LEVELS} value={form.level} onChange={v => setForm({ ...form, level: v })} label="Knowledge Level *" /></div>
                        <div><SingleToggle options={PROFESSIONS} value={form.profession} onChange={v => setForm({ ...form, profession: v })} label="Your Profession *" /></div>
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="animate-fade">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Step 2 of 4 — Projects & teaching preferences</p>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div className="form-label" style={{ marginBottom: '0.5rem' }}>Real-time Projects / Deployment Links</div>
                            {form.projects.map((p, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input className="form-input" placeholder={`https://project-${i + 1}.vercel.app`}
                                        value={p} onChange={e => {
                                            const np = [...form.projects]; np[i] = e.target.value; setForm({ ...form, projects: np });
                                        }} />
                                    {form.projects.length > 1 && (
                                        <button type="button" style={{ background: 'none', border: 'none', color: '#ef9a9a', cursor: 'pointer', fontSize: '1.1rem' }}
                                            onClick={() => setForm({ ...form, projects: form.projects.filter((_, j) => j !== i) })}>✕</button>
                                    )}
                                </div>
                            ))}
                            {form.projects.length < 5 && (
                                <button type="button" className="btn btn-ghost btn-sm"
                                    onClick={() => setForm({ ...form, projects: [...form.projects, ''] })}>+ Add Link</button>
                            )}
                        </div>
                        <div><SingleToggle options={LANGUAGES} value={form.teachingLanguage} onChange={v => setForm({ ...form, teachingLanguage: v })} label="Teaching Language *" /></div>
                    </div>
                )}

                {/* Step 3: Schedule */}
                {step === 3 && (
                    <div className="animate-fade">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Step 3 of 4 — Availability & meeting preference</p>
                        <div style={{ marginBottom: '1.25rem' }}><MultiToggle options={DAYS} selected={form.availableDates} onChange={v => setForm({ ...form, availableDates: v })} label="Available Days *" /></div>
                        <div style={{ marginBottom: '1.25rem' }}><MultiToggle options={TIMES} selected={form.availableTimes} onChange={v => setForm({ ...form, availableTimes: v })} label="Available Times" /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <input type="checkbox" id="meetup" checked={form.meetupOk} onChange={e => setForm({ ...form, meetupOk: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                            <label htmlFor="meetup" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>📍 I'm open to real-time meetups based on location</label>
                        </div>
                    </div>
                )}

                {/* Step 4: Mode */}
                {step === 4 && (
                    <div className="animate-fade">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Step 4 of 4 — Teaching mode</p>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            {[
                                { value: 'teach-only', label: '🎓 Teach Only', desc: 'I want to teach this skill to others' },
                                { value: 'teach-learn', label: '🔄 Teach & Learn', desc: 'I teach this skill and also want to learn another' }
                            ].map(m => (
                                <div key={m.value} onClick={() => setForm({ ...form, mode: m.value, wantToLearn: [] })}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                        border: `2px solid ${form.mode === m.value ? 'var(--accent)' : 'var(--border)'}`,
                                        background: form.mode === m.value ? 'rgba(255,111,0,0.1)' : 'transparent',
                                        transition: 'var(--transition)'
                                    }}>
                                    <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{m.label}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                                </div>
                            ))}
                        </div>
                        {form.mode === 'teach-learn' && (
                            <div>
                                <div className="form-label" style={{ marginBottom: '0.75rem' }}>Skills I want to learn in return:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
                                    {SKILLS_LIST.filter(s => s !== form.skillName).map(s => (
                                        <button key={s} type="button"
                                            className={`skill-chip${form.wantToLearn.includes(s) ? ' selected' : ''}`}
                                            onClick={() => setForm({ ...form, wantToLearn: form.wantToLearn.includes(s) ? form.wantToLearn.filter(x => x !== s) : [...form.wantToLearn, s] })}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,111,0,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,111,0,0.2)' }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent)' }}>Summary ✅</div>
                            <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
                                <span className="badge badge-primary" style={{ marginRight: '0.4rem' }}>{form.skillName}</span>
                                <span className="badge badge-info" style={{ marginRight: '0.4rem' }}>{form.level}</span>
                                <span className="badge badge-warning" style={{ marginRight: '0.4rem' }}>{form.profession}</span>
                                <span className="badge badge-success">{form.teachingLanguage}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button className="btn btn-ghost" onClick={step === 1 ? onClose : prev}>{step === 1 ? 'Cancel' : '← Back'}</button>
                    {step < 4 ? (
                        <button className="btn btn-primary" onClick={next}
                            disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)}>
                            Next →
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : '✅ Add Skill'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
