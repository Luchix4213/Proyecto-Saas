import { useState, useEffect } from 'react';
import { Mail, Lock, Save, ShieldCheck, Building2, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, type UpdateProfileData } from '../../services/authService';

export const ProfilePage = () => {
    const { user } = useAuth();

    const [formData, setFormData] = useState<UpdateProfileData>({
        nombre: '',
        paterno: '',
        materno: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nombre: user.nombre || '',
            }));
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const profile = await authService.getProfile();
            setFormData(prev => ({
                ...prev,
                nombre: profile.nombre || '',
                paterno: profile.paterno || '',
                materno: profile.materno || '',
                email: profile.email || '',
                password: ''
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear success message on change
        if (success) setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');

        try {
            const dataToSend = { ...formData };
            if (!dataToSend.password) delete dataToSend.password;

            const updatedUser = await authService.updateProfile(dataToSend);

            // Update local storage user
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const newUserState = { ...currentUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newUserState));

            setSuccess('Perfil actualizado correctamente. Los cambios se reflejarán inmediatamente.');
            fetchProfile();

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[80vh] w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Section */}
            <div className="mb-8 relative z-10">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl text-teal-600 shadow-sm border border-teal-200/50">
                        <UserCircle size={32} />
                    </div>
                    Mi Perfil
                </h1>
                <p className="text-slate-500 mt-2 text-lg ml-1">
                    Gestiona tu información personal, seguridad y preferencias de cuenta.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Sidebar / User Card Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-teal-500 to-emerald-600"></div>
                        <div className="pt-16 pb-8 px-6 text-center relative">
                            <div className="relative inline-block">
                                <div className="h-28 w-28 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-teal-700 shadow-lg border-[6px] border-white relative z-10 transform group-hover:scale-105 transition-transform duration-300">
                                    {formData.nombre?.charAt(0)}{formData.paterno?.charAt(0)}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-teal-500 blur-lg opacity-20 transform scale-110"></div>
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-slate-800">
                                {formData.nombre} {formData.paterno}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">{formData.email}</p>

                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 uppercase tracking-wide">
                                    <ShieldCheck size={12} />
                                    {user?.rol}
                                </span>
                                {user?.tenant_id && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                        <Building2 size={12} />
                                        Tenant {user?.tenant_id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    Información Personal
                                </h3>
                                {(success || error) && (
                                     <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 animate-fade-in ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {success ? <ShieldCheck size={16} /> : <ShieldCheck size={16} />}
                                        {success || error}
                                     </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Nombre</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Apellido Paterno</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="paterno"
                                            value={formData.paterno}
                                            onChange={handleChange}
                                            className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                                            placeholder="Tu apellido"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Apellido Materno</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="materno"
                                            value={formData.materno}
                                            onChange={handleChange}
                                            className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                                            placeholder="Opcional"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Email Corporativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Lock className="text-teal-500" size={20} />
                                    Seguridad y Contraseña
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Nueva Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
                                                placeholder="••••••••••••"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 ml-1">
                                            Deja este campo vacío si no deseas cambiar tu contraseña actual.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end pt-6 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative overflow-hidden group flex items-center gap-2 px-8 py-3.5 bg-slate-900 border border-transparent rounded-xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                                    <span>{loading ? 'Guardando Cambios...' : 'Guardar Cambios'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
