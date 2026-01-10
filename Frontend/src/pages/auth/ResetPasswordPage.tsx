import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden');
            return;
        }

        setStatus('loading');
        try {
            await api.post('/auth/reset-password', { token, password });
            setStatus('success');
            setMessage('Contraseña actualizada correctamente');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setStatus('error');
            setMessage('Error al restablecer contraseña. El token puede ser inválido o haber expirado.');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <p className="text-red-600">Token de recuperación no válido o ausente.</p>
                    <button onClick={() => navigate('/login')} className="mt-4 text-indigo-600">Ir al Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Nueva Contraseña</h2>
                    <p className="mt-2 text-gray-600">Ingresa tu nueva contraseña</p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-50 text-green-800 p-4 rounded-md text-center">
                        {message}
                        <p className="text-sm mt-2">Redirigiendo al login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
