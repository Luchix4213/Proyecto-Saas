import { useState } from 'react';
import { X } from 'lucide-react';
import { userService } from '../../services/userService';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

export const ChangePasswordModal = ({ isOpen, onClose, userId }: ChangePasswordModalProps) => {
    const [formData, setFormData] = useState({
        oldPassword: '', // TODO: En un flujo real de admin cambiando a otro, NO pide oldPassword. Pero el endpoint actual lo pide.
        // Verificaremos si el usuario actual es Admin para obviar esto o si simulamos el flujo completo. 
        // ACTUALIZACIÓN: Como es "Gestión de Usuarios", asumimos que un Admin resetea passwords. 
        // Pero el endpoint actual `POST /password/:id` pide `oldPassword`. 
        // PARA CORREGIR: El backend debería tener un endpoint de "Admin Reset Password" que NO pida la anterior.
        // POR AHORA: Usaremos inputs para simular el "Cambio personal" o lo adaptaremos.
        // EL USUARIO PIDIÓ: "cambiarles la contraseña".
        newPassword: ''
    });

    // NOTA: El endpoint actual del backend PIDE oldPassword. Esto es inusual para un Admin gestionando otros usuarios.
    // Voy a poner ambos campos para que funcione con el backend actual, aunque sea un poco extraño UX para un admin.

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await userService.changePassword(userId, formData);
            setSuccess('Contraseña actualizada correctamente');
            setTimeout(() => {
                onClose();
                setFormData({ oldPassword: '', newPassword: '' });
                setSuccess('');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Cambiar Contraseña</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                    {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{success}</div>}

                    <div>
                        <div className="bg-yellow-50 text-yellow-800 text-xs p-2 mb-2 rounded border border-yellow-200">
                            Nota: Como el endpoint actual requiere la contraseña anterior validada, debes ingresarla.
                            (En producción, un Admin resetearía sin saber la anterior).
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.oldPassword}
                            onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Cambiar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
