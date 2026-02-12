import { useState } from 'react';
import { Search, Download, Share2, Bell, HelpCircle, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/storage/supabaseService';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import GuideModal from '../features/GuideModal';
import './Header.css';

export default function Header({ title, actions }) {
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const signOut = useAuthStore(state => state.signOut);

    const handleSignOut = async () => {
        try {
            await authService.signOut();
            signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
                {actions && (
                    <div className="header-actions">
                        {actions}
                    </div>
                )}

                <div className="header-tools">
                    <button
                        className="header-icon-btn"
                        onClick={() => setIsGuideOpen(true)}
                        title="Guia de Importação"
                    >
                        <HelpCircle size={20} />
                    </button>
                    <button
                        className="header-icon-btn"
                        title="Alternar Tema"
                    >
                        <Moon size={20} />
                    </button>
                    <button
                        className="header-icon-btn logout-btn"
                        onClick={handleSignOut}
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="header-user">
                    {user && <span className="header-username">{user.email}</span>}
                    <Avatar
                        alt={user?.email || "User"}
                        size="md"
                    />
                </div>
            </div>

            <GuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />
        </header>
    );
}
