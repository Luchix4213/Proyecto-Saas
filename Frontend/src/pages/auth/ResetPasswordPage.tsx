import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [manualToken, setManualToken] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleManualTokenSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (manualToken.trim()) {
            setStatus('loading');
            try {
                // Verificar token antes de mostrar formulario de contraseña
                await api.post('/auth/verify-token', { token: manualToken });
                setSearchParams({ token: manualToken });
                setStatus('idle'); // Reset status for next form
                setMessage('');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Código inválido o expirado.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden');
            return;
        }

        // Strong password check
        const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!strongPasswordRegex.test(password)) {
            setStatus('error');
            setMessage('La contraseña debe tener al menos 6 caracteres, incluir una mayúscula y un número.');
            return;
        }

        setStatus('loading');
        try {
            await api.post('/auth/reset-password', { token, password });
            setStatus('success');
            setMessage('Contraseña actualizada correctamente');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            setStatus('error');
            //@ts-ignore
            setMessage(error.response?.data?.message || 'Error al restablecer contraseña.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="max-w-md w-full relative z-10 p-6 animate-fade-in-up">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-500/30 mb-6">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {token ? 'Nueva Contraseña' : 'Verificación'}
                        </h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            {token ? 'Establece tu nueva contraseña segura' : 'Ingresa el código que recibiste por correo'}
                        </p>
                    </div>

                    {/* Step 1: Manual Token Entry (if no token in URL) */}
                    {!token ? (
                        <form onSubmit={handleManualTokenSubmit} className="space-y-6 animate-fade-in">
                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-shake">
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                                    Código de Verificación
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:bg-white transition-all placeholder-slate-400 text-center tracking-widest text-lg font-mono"
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    placeholder="XXXXXX"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 shadow-lg shadow-slate-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Verificando...' : 'Verificar Código'}
                            </button>

                            <div className="text-center pt-2">
                                <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                    <ArrowLeft size={16} /> Volver al Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Step 2: Reset Password Form */
                        <>
                            {status === 'success' ? (
                                <div className="text-center animate-scale-in">
                                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mb-6">
                                        <div className="inline-flex p-3 bg-emerald-100 rounded-full text-emerald-600 mb-3 animate-bounce">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="font-bold text-emerald-800 text-lg mb-1">¡Contraseña Actualizada!</h3>
                                        <p className="text-emerald-700 text-sm">Serás redirigido al login en unos segundos...</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                                    {status === 'error' && (
                                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-shake">
                                            {message}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nueva Contraseña</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:bg-white transition-all placeholder-slate-400"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Confirmar Contraseña</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:bg-white transition-all placeholder-slate-400"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />}
                                            </button>
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
                                                <span>Actualizando...</span>
                                            </>
                                        ) : (
                                            <>
                                                Cambiar Contraseña <ArrowRight size={18} strokeWidth={2.5} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
