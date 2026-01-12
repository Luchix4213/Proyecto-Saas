import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from '../../services/userService';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: Usuario | null;
}

export const UserForm = ({ isOpen, onClose, onSuccess, userToEdit }: UserFormProps) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        paterno: '',
        materno: '',
        email: '',
        password: '',
        rol: 'VENDEDOR',
        estado: 'ACTIVO'
    });

    // Using object for inline errors
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState('');
    const [loading, setLoading] = useState(false);

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
                rol: user?.rol === 'PROPIETARIO' ? 'VENDEDOR' : 'VENDEDOR',
                estado: 'ACTIVO'
            });
        }
        setErrors({});
        setGlobalError('');
    }, [userToEdit, isOpen, user]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const nameRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
        // Simplified password regex for admin created users (optional: could be strict too)
        const passwordRegex = /.{6,}/;

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (!nameRegex.test(formData.nombre)) {
            newErrors.nombre = 'Solo se permiten letras';
        }

        if (!formData.paterno.trim()) {
            newErrors.paterno = 'El apellido es requerido';
        } else if (!nameRegex.test(formData.paterno)) {
            newErrors.paterno = 'Solo se permiten letras';
        }

        if (formData.materno.trim() && !nameRegex.test(formData.materno)) {
            newErrors.materno = 'Solo se permiten letras';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validate password only if creating new user
        if (!userToEdit && !formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (!userToEdit && !passwordRegex.test(formData.password)) {
            newErrors.password = 'Mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setGlobalError('');

        try {
            // Sanitize
            const cleanedData = {
                ...formData,
                nombre: formData.nombre.trim(),
                paterno: formData.paterno.trim(),
                materno: formData.materno.trim(),
                email: formData.email.trim()
            };

            if (userToEdit) {
                const { password, ...updateData } = cleanedData; // No enviamos password en update
                await userService.update(userToEdit.usuario_id, updateData);
            } else {
                const { estado, ...createData } = cleanedData; // Estado se asigna por defecto en backend
                await userService.create(createData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setGlobalError(err.response?.data?.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear specific error
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
                    {globalError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{globalError}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${errors.nombre ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                maxLength={50}
                            />
                            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paterno</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${errors.paterno ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                value={formData.paterno}
                                onChange={(e) => handleChange('paterno', e.target.value)}
                                maxLength={50}
                            />
                            {errors.paterno && <p className="mt-1 text-xs text-red-600">{errors.paterno}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Materno</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${errors.materno ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                value={formData.materno}
                                onChange={(e) => handleChange('materno', e.target.value)}
                                maxLength={50}
                            />
                             {errors.materno && <p className="mt-1 text-xs text-red-600">{errors.materno}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.rol}
                                onChange={(e) => handleChange('rol', e.target.value)}
                                disabled={user?.rol === 'PROPIETARIO'}
                            >
                                <option value="VENDEDOR">Vendedor</option>
                                <option value="PROPIETARIO" disabled={user?.rol === 'PROPIETARIO'}>Propietario</option>
                                <option value="ADMIN" disabled={user?.rol === 'PROPIETARIO'}>Admin</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            disabled={!!userToEdit} // No editar email por ahora
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none disabled:bg-gray-100 disabled:text-gray-500 ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            maxLength={255}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    {!userToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="password"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                maxLength={100}
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>
                    )}

                    {userToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.estado}
                                onChange={(e) => handleChange('estado', e.target.value)}
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
