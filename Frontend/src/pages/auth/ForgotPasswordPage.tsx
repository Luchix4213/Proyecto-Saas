import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            setStatus('success');
        } catch (error) {
            setMessage('Error al procesar la solicitud. Intenta nuevamente.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="max-w-md w-full relative z-10 p-6 animate-fade-in-up">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 mb-6 transition-transform hover:rotate-12 duration-500">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Recuperar Contraseña</h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">Ingresa tu email corporativo para recibir instrucciones</p>
                    </div>

                    {status === 'success' ? (
                        <div className="text-center animate-scale-in">
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mb-8 flex flex-col items-center">
                                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 mb-3 animate-bounce">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="font-bold text-emerald-800 text-lg mb-2">¡Correo Enviado!</h3>
                                <p className="text-emerald-700 text-sm">{message}</p>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all hover:shadow-lg"
                                >
                                    <ArrowLeft size={18} /> Volver al inicio de sesión
                                </Link>
                                <Link
                                    to="/reset-password"
                                    className="block text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors"
                                >
                                    Ya tengo un código de verificación
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
                                    <div className="p-1 bg-red-100 rounded-full flex-shrink-0">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </div>
                                    {message}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    Email Corporativo
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:bg-white transition-all placeholder-slate-400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ejemplo@empresa.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg shadow-teal-500/30 text-white font-bold hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        Enviar enlace de recuperación <ArrowRight size={18} strokeWidth={2.5} />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                    <ArrowLeft size={16} /> Volver al login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
