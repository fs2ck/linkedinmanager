import { Search, Download, Share2, Bell } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import './Header.css';

export default function Header({ title, actions }) {
    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
                <div className="header-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="search-input"
                    />
                </div>

                {actions && (
                    <div className="header-actions">
                        {actions}
                    </div>
                )}

                <button className="header-icon-btn">
                    <Bell size={20} />
                </button>

                <Avatar
                    alt="User"
                    size="md"
                />
            </div>
        </header>
    );
}
