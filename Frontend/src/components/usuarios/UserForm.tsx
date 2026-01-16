import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, Save } from 'lucide-react';
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
                rol: user?.rol === 'ADMIN' ? 'ADMIN' : 'VENDEDOR',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in border border-slate-100">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <User className="text-teal-600" />
                        {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
                    {globalError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100">{globalError}</div>}

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all ${errors.nombre
                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'}`}
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                maxLength={50}
                                placeholder="Juan"
                            />
                            {errors.nombre && <p className="text-xs text-red-500 font-bold">{errors.nombre}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Apellido Paterno</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all ${errors.paterno
                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'}`}
                                value={formData.paterno}
                                onChange={(e) => handleChange('paterno', e.target.value)}
                                maxLength={50}
                                placeholder="Pérez"
                            />
                            {errors.paterno && <p className="text-xs text-red-500 font-bold">{errors.paterno}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Apellido Materno</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all ${errors.materno
                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'}`}
                                value={formData.materno}
                                onChange={(e) => handleChange('materno', e.target.value)}
                                maxLength={50}
                                placeholder="López"
                            />
                            {errors.materno && <p className="text-xs text-red-500 font-bold">{errors.materno}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 appearance-none"
                                    value={formData.rol}
                                    onChange={(e) => handleChange('rol', e.target.value)}
                                >
                                    <option value="VENDEDOR">Vendedor</option>
                                    <option value="PROPIETARIO">Propietario</option>
                                    <option value="ADMIN" disabled={user?.rol !== 'ADMIN'}>Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Corporativo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                disabled={!!userToEdit} // No editar email por ahora
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 ${errors.email
                                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                    : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'}`}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                maxLength={255}
                                placeholder="usuario@empresa.com"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email}</p>}
                    </div>

                    {!userToEdit && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all ${errors.password
                                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                                        : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'}`}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    maxLength={100}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-bold">{errors.password}</p>}
                        </div>
                    )}

                    {userToEdit && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</label>
                            <select
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                value={formData.estado}
                                onChange={(e) => handleChange('estado', e.target.value)}
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors font-medium text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-teal-500/30"
                        >
                            <Save size={18} />
                            {loading ? 'Guardando...' : 'Guardar Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
