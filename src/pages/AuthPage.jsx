import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, UserPlus, Linkedin, ShieldCheck } from 'lucide-react';
import { authService } from '../services/storage/supabaseService';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import './AuthPage.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const setSession = useAuthStore(state => state.setSession);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { session } = await authService.signIn(email, password);
                setSession(session);
                toast.success('Bem-vindo de volta!');
                navigate('/');
            } else {
                await authService.signUp(email, password);
                toast.success('Cadastro realizado! Por favor, verifique seu e-mail.');
                setIsLogin(true);
            }
        } catch (error) {
            console.error('Auth error:', error);
            toast.error(error.message || 'Ocorreu um erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-shimmer"></div>
            </div>

            <div className="auth-content">
                <div className="auth-logo-section">
                    <div className="auth-icon-wrapper">
                        <Linkedin size={32} className="auth-icon" />
                    </div>
                    <h1 className="auth-title">LinkedIn Manager</h1>
                    <p className="auth-subtitle">Sua estratégia de conteúdo elevada por IA</p>
                </div>

                <Card className="auth-card">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(true)}
                        >
                            <LogIn size={18} />
                            Login
                        </button>
                        <button
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            <UserPlus size={18} />
                            Cadastro
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-form-group">
                            <label>E-mail</label>
                            <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon="mail"
                                fullWidth
                            />
                        </div>

                        <div className="auth-form-group">
                            <label>Senha</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                icon="lock"
                                fullWidth
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            className="auth-submit-btn"
                        >
                            {isLogin ? 'Entrar Agora' : 'Criar Minha Conta'}
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <ShieldCheck size={14} />
                        <span>Ambiente seguro via Supabase Auth</span>
                    </div>
                </Card>

                <p className="auth-switch-text">
                    {isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}
                    <button
                        className="auth-link-btn"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Cadastre-se aqui' : 'Faça login aqui'}
                    </button>
                </p>
            </div>
        </div>
    );
}
