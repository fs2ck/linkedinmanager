import { useState } from 'react';
import { Search, Download, Share2, Bell, HelpCircle, Moon } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import GuideModal from '../features/GuideModal';
import './Header.css';

export default function Header({ title, actions }) {
    const [isGuideOpen, setIsGuideOpen] = useState(false);

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
                </div>

                <Avatar
                    alt="User"
                    size="md"
                />
            </div>

            <GuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />
        </header>
    );
}
