import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    if (user.isAdmin) {
        return (
            <nav className="navbar">
                <div className="container navbar-inner">
                    <span className="navbar-logo">PEER<span>Learn</span></span>
                    <div className="navbar-links">
                        <span className="badge badge-warning" style={{ marginRight: '0.5rem' }}>Admin</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.name}</span>
                        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <NavLink to="/feed" className="navbar-logo">PEER<span>Learn</span></NavLink>
                <div className="navbar-links">
                    <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/feed">🔍 Feed</NavLink>
                    <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/requests">📩 Requests</NavLink>
                    <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/profile">👤 Profile</NavLink>
                </div>
            </div>
        </nav>
    );
}
