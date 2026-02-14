import React from 'react';
import { Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="nav-logo">
                <Rocket size={24} className="rocket-icon" />
                <span>ElevateIn</span>
            </Link>

            <div className="nav-links">
                <a href="#features" className="nav-link">Funcionalidades</a>
                <a href="#steps" className="nav-link">Como Funciona</a>
                <a href="#pricing" className="nav-link">Planos</a>
                <a href="#faq" className="nav-link">FAQ</a>
            </div>

            <div className="nav-actions">
                <button
                    className="nav-btn nav-btn-primary"
                    onClick={() => navigate('/login')}
                >
                    Começar agora
                </button>
            </div>
        </nav>
    );
}
