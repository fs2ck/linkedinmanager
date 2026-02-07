import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Edit3,
    Send,
    Settings
} from 'lucide-react';
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
                    <div className="logo-icon">LM</div>
                    <span className="logo-text">LinkedIn Manager</span>
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
        </aside>
    );
}
