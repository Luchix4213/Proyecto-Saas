import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h2>
                    <p className="mt-2 text-gray-600">Ingresa tu email para recibir instrucciones</p>
                </div>

                {status === 'success' ? (
                    <div className="text-center">
                        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
                            {message}
                        </div>
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {message}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Corporativo
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                                Volver al login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
