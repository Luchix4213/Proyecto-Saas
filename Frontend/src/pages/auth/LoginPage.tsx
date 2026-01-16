import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Home } from 'lucide-react';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({ email, password });
            if (user?.rol === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-900 relative overflow-hidden">
            {/* Back to Home Button */}
            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all text-sm font-semibold shadow-xl">
                    <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                    <span>Volver al Inicio</span>
                </Link>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-white/20">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-2xl mb-4 shadow-lg shadow-teal-500/30">
                        <span className="text-white text-3xl font-bold">K</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Bienvenido a Kipu</h1>
                    <p className="text-slate-500 mt-2 font-medium">Gestión inteligente para tu negocio</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
                        <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Corporativo
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-600">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50 focus:bg-white"
                                placeholder="tu@empresa.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Contraseña
                            </label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ?
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-slate-600" /> :
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-slate-600" />
                                }
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-600/20 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Ingresar
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-slate-600">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700 transition-colors inline-flex items-center gap-1">
                            Registra tu empresa
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
