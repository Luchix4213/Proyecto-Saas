import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Building2, User, Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, MapPin, Phone, Briefcase } from 'lucide-react';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Changed from single string to object for field-specific errors
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        nombre_empresa: '',
        telefono_empresa: '',
        email_empresa: '',
        direccion_empresa: '',
        nombre: '',
        paterno: '',
        materno: '',
        rubro: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/; // Basic phone validation

        if (!formData.nombre_empresa.trim()) newErrors.nombre_empresa = 'El nombre de la empresa es requerido';

        if (!formData.email_empresa.trim()) {
            newErrors.email_empresa = 'El email de la empresa es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email_empresa)) {
            newErrors.email_empresa = 'Formato de email inválido';
        }

        if (formData.telefono_empresa.trim() && !phoneRegex.test(formData.telefono_empresa)) {
            newErrors.telefono_empresa = 'Formato de teléfono inválido (solo números y símbolos básicos)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        const nameRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/; // Letters and spaces only, including Spanish chars
        const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (!nameRegex.test(formData.nombre)) {
            newErrors.nombre = 'El nombre solo puede contener letras';
        }

        if (!formData.paterno.trim()) {
            newErrors.paterno = 'El apellido paterno es requerido';
        } else if (!nameRegex.test(formData.paterno)) {
            newErrors.paterno = 'El apellido solo puede contener letras';
        }

        if (formData.materno.trim() && !nameRegex.test(formData.materno)) {
            newErrors.materno = 'El apellido solo puede contener letras';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email de usuario es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Formato de email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (!strongPasswordRegex.test(formData.password)) {
            newErrors.password = 'Mínimo 6 caracteres, una mayúscula y un número';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalError('');

        // Trim inputs
        const trimmedData = {
            ...formData,
            email_empresa: formData.email_empresa.trim(),
            nombre_empresa: formData.nombre_empresa.trim(),
            email: formData.email.trim(),
            nombre: formData.nombre.trim(),
            paterno: formData.paterno.trim(),
            materno: formData.materno.trim(),
            rubro: formData.rubro.trim(),
            telefono_empresa: formData.telefono_empresa.trim(),
            direccion_empresa: formData.direccion_empresa.trim()
        };

        if (step === 1) {
            if (validateStep1()) {
                setFormData(trimmedData);
                setStep(2);
            }
            return;
        }

        // Validate Step 2
        if (!validateStep2()) {
            return;
        }

        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...registerData } = trimmedData;
            await authService.register(registerData);
            alert('Registro exitoso. Tu cuenta ha sido creada y está pendiente de aprobación por el administrador.');
            navigate('/login');
        } catch (err: any) {
            setGlobalError(err.response?.data?.message || 'Error al registrar la empresa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-xl w-full relative z-10 p-6 animate-fade-in-up">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        {/* Logo or Icon */}
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/30 mb-6 transition-transform hover:scale-110 duration-500">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Crea tu cuenta Kipu
                        </h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            {step === 1 ? 'Paso 1: Datos de tu Empresa' : 'Paso 2: Datos del Administrador'}
                        </p>
                        {/* Steps Indicator */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${step === 1 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                            <div className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                        </div>
                    </div>

                    {globalError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
                            <div className="p-1 bg-red-100 rounded-full text-red-600 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-sm font-medium text-red-600 pt-0.5">{globalError}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        {step === 1 ? (
                            <div className="space-y-5 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nombre de la Empresa</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="nombre_empresa"
                                            maxLength={100}
                                            className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.nombre_empresa
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                }`}
                                            placeholder="Ej: Mi Negocio S.R.L."
                                            value={formData.nombre_empresa}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.nombre_empresa && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.nombre_empresa}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Corporativo</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email_empresa"
                                            maxLength={255}
                                            className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.email_empresa
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                }`}
                                            placeholder="contacto@empresa.com"
                                            value={formData.email_empresa}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.email_empresa && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.email_empresa}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Teléfono (Opcional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="telefono_empresa"
                                                maxLength={20}
                                                className={`block w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.telefono_empresa
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                    }`}
                                                value={formData.telefono_empresa}
                                                onChange={handleChange}
                                                placeholder="+591 7000..."
                                            />
                                        </div>
                                        {errors.telefono_empresa && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.telefono_empresa}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Rubro</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Briefcase className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="rubro"
                                                maxLength={50}
                                                className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:bg-white transition-all placeholder-slate-400"
                                                value={formData.rubro}
                                                onChange={handleChange}
                                                placeholder="Ej: Farmacia"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Dirección (Opcional)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="direccion_empresa"
                                            maxLength={200}
                                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:bg-white transition-all placeholder-slate-400"
                                            placeholder="Av. Principal #123"
                                            value={formData.direccion_empresa}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            maxLength={50}
                                            className={`block w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.nombre
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                }`}
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Juan"
                                        />
                                        {errors.nombre && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.nombre}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Apellido</label>
                                        <input
                                            type="text"
                                            name="paterno"
                                            maxLength={50}
                                            className={`block w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.paterno
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                }`}
                                            value={formData.paterno}
                                            onChange={handleChange}
                                            placeholder="Pérez"
                                        />
                                        {errors.paterno && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.paterno}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email (Usuario)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            maxLength={255}
                                            className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.email
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                }`}
                                            placeholder="juan.perez@empresa.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Contraseña</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            maxLength={100}
                                            className={`block w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.password
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                }`}
                                            value={formData.password}
                                            onChange={handleChange}
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
                                    {errors.password && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            maxLength={100}
                                            className={`block w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.confirmPassword
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                }`}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
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
                                    {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center gap-4 pt-4">
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-2.5 text-slate-600 font-bold hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Atrás
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg shadow-teal-500/30 text-white font-bold hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${step === 1 ? 'ml-auto w-full' : 'flex-1'}`}
                            >
                                {loading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        {step === 1 ? 'Siguiente' : 'Registrar Empresa'}
                                        {step === 1 ? <ArrowRight size={18} strokeWidth={2.5} /> : <CheckCircle2 size={18} strokeWidth={2.5} />}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center animate-fade-in-up delay-200">
                    <p className="text-sm font-medium text-slate-400">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-teal-400 hover:text-teal-300 font-bold transition-colors">
                            Inicia Sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
