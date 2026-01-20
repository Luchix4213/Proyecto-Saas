import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, Save, Plus } from 'lucide-react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Dynamic Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Premium Modal Container */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-slate-100">

                {/* Header: Integrated with Page Style */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-teal-500/30">
                            <User size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {userToEdit ? 'Editar Miembro' : 'Nuevo Integrante'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {userToEdit ? 'Actualizar perfil' : 'Configurar acceso al sistema'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl transition-all hover:rotate-90 duration-300 shadow-sm border border-transparent hover:border-slate-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content: Scrollable Area */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0" noValidate>
                    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                        {globalError && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-bold border border-red-100 flex items-center gap-3 animate-shake">
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                {globalError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre</label>
                                <input
                                    type="text"
                                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-slate-700 ${errors.nombre
                                        ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                        : 'border-slate-200 focus:ring-teal-500/10 focus:border-teal-500'}`}
                                    value={formData.nombre}
                                    onChange={(e) => handleChange('nombre', e.target.value)}
                                    maxLength={50}
                                    placeholder="Nombre del usuario"
                                />
                                {errors.nombre && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-1 ml-1">{errors.nombre}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Apellido Paterno</label>
                                <input
                                    type="text"
                                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-slate-700 ${errors.paterno
                                        ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                        : 'border-slate-200 focus:ring-teal-500/10 focus:border-teal-500'}`}
                                    value={formData.paterno}
                                    onChange={(e) => handleChange('paterno', e.target.value)}
                                    maxLength={50}
                                    placeholder="Primer apellido"
                                />
                                {errors.paterno && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-1 ml-1">{errors.paterno}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Apellido Materno</label>
                                <input
                                    type="text"
                                    className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-slate-700 ${errors.materno
                                        ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                        : 'border-slate-200 focus:ring-teal-500/10 focus:border-teal-500'}`}
                                    value={formData.materno}
                                    onChange={(e) => handleChange('materno', e.target.value)}
                                    maxLength={50}
                                    placeholder="Segundo apellido (opcional)"
                                />
                                {errors.materno && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-1 ml-1">{errors.materno}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nivel de Acceso</label>
                                <div className="relative group">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                    <select
                                        className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                        value={formData.rol}
                                        onChange={(e) => handleChange('rol', e.target.value)}
                                    >
                                        <option value="VENDEDOR">Vendedor / Operador</option>
                                        <option value="PROPIETARIO">Propietario / Gerente</option>
                                        <option value="ADMIN" disabled={user?.rol !== 'ADMIN'}>Administrador Global</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Plus size={16} className="rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Corporativo</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    disabled={!!userToEdit}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${errors.email
                                        ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                        : 'border-slate-200 focus:ring-teal-500/10 focus:border-teal-500'}`}
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    maxLength={255}
                                    placeholder="usuario@empresa.com"
                                />
                            </div>
                            {errors.email && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-1 ml-1">{errors.email}</p>}
                        </div>

                        {!userToEdit && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contraseña Inicial</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-slate-700 ${errors.password
                                            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                            : 'border-slate-200 focus:ring-teal-500/10 focus:border-teal-500'}`}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        maxLength={100}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-1 ml-1">{errors.password}</p>}
                                <p className="text-[10px] text-slate-400 font-medium ml-1">Mínimo 6 caracteres alfanuméricos.</p>
                            </div>
                        )}

                        {userToEdit && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Estado de la Cuenta</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 cursor-pointer"
                                    value={formData.estado}
                                    onChange={(e) => handleChange('estado', e.target.value)}
                                >
                                    <option value="ACTIVO">Habilitado</option>
                                    <option value="INACTIVO">Inhabilitado (Baja)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions: Sticky at Bottom */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] border border-transparent hover:border-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                        >
                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                            <span>{loading ? 'Sincronizando...' : userToEdit ? 'Guardar Cambios' : 'Registrar Miembro'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
