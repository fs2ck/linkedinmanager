import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Edit3,
    Send,
    Settings
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Logo from '../ui/Logo';
import './Sidebar.css';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Planejamento', path: '/planner' },
    { icon: FileText, label: 'Rascunhos', path: '/drafts' },
    { icon: Edit3, label: 'Editor', path: '/editor' },
    { icon: Send, label: 'Publicações', path: '/publish' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon-wrapper">
                        <Logo size={28} className="logo-icon-svg" />
                    </div>
                    <span className="logo-text">ElevateIn</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <Avatar size="md" alt="Felipe Barbosa" />
                    <div className="user-info">
                        <span className="user-name">Felipe Barbosa</span>
                        <span className="user-email">felipe@exemplo.com</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
