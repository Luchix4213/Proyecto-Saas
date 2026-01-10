import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { userService } from '../../services/userService';
import type { Usuario } from '../../services/userService';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: Usuario | null;
}

export const UserForm = ({ isOpen, onClose, onSuccess, userToEdit }: UserFormProps) => {
    const [formData, setFormData] = useState({
        nombre: '',
        paterno: '',
        materno: '',
        email: '',
        password: '',
        rol: 'VENDEDOR',
        estado: 'ACTIVO'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                nombre: userToEdit.nombre,
                paterno: userToEdit.paterno || '',
                materno: userToEdit.materno || '',
                email: userToEdit.email,
                password: '', // Password no se edita aquí
                rol: userToEdit.rol,
                estado: userToEdit.estado
            });
        } else {
            setFormData({
                nombre: '',
                paterno: '',
                materno: '',
                email: '',
                password: '',
                rol: 'VENDEDOR',
                estado: 'ACTIVO'
            });
        }
        setError('');
    }, [userToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (userToEdit) {
                const { password, ...updateData } = formData; // No enviamos password en update
                await userService.update(userToEdit.usuario_id, updateData);
            } else {
                const { estado, ...createData } = formData; // Estado se asigna por defecto en backend
                await userService.create(createData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paterno</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.paterno}
                                onChange={(e) => setFormData({ ...formData, paterno: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Materno</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.materno}
                                onChange={(e) => setFormData({ ...formData, materno: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                            >
                                <option value="VENDEDOR">Vendedor</option>
                                <option value="MICROEMPRESA_P">Propietario</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            disabled={!!userToEdit} // No editar email por ahora
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 placeholder-gray-400 text-gray-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {!userToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    )}

                    {userToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </div>
                    )}

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
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
