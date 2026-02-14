import React from 'react';
import { Rocket, Linkedin, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="landing-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="nav-logo" style={{ marginBottom: '16px' }}>
                        <Rocket className="rocket-icon" size={24} />
                        <span>ElevateIn</span>
                    </div>
                    <p className="footer-desc">
                        A plataforma de IA definitiva para quem deseja transformar sua presença digital em resultados reais.
                    </p>
                    <div className="footer-socials">
                        <a href="#" className="footer-social-icon" aria-label="LinkedIn">
                            <Linkedin size={20} />
                        </a>
                        <a href="#" className="footer-social-icon" aria-label="Twitter">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="footer-social-icon" aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                    </div>
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Produto</h4>
                        <a href="#features">Funcionalidades</a>
                        <a href="#pricing">Preços</a>
                        <a href="#">Integrações</a>
                        <a href="#">Chrome Extension</a>
                    </div>
                    <div className="footer-col">
                        <h4>Empresa</h4>
                        <a href="#">Sobre Nós</a>
                        <a href="#">Carreiras</a>
                        <a href="#">Blog</a>
                        <a href="#">Privacidade</a>
                    </div>
                    <div className="footer-col">
                        <h4>Suporte</h4>
                        <a href="#">Help Center</a>
                        <a href="#">Comunidade</a>
                        <a href="#">Contato</a>
                        <a href="#">Status</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 ElevateIn AI. Todos os direitos reservados.</p>
                <div className="footer-bottom-links">
                    <a href="#">Termos de Uso</a>
                    <a href="#">LGPD</a>
                    <a href="#">Cookies</a>
                </div>
            </div>
        </footer>
    );
}
