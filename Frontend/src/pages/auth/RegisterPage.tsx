import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Building2, User, Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Crea tu cuenta Kipu
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1 ? 'Paso 1: Datos de tu Empresa' : 'Paso 2: Datos del Administrador'}
                    </p>
                </div>

                {globalError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                        <span>•</span> {globalError}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="nombre_empresa"
                                        maxLength={100}
                                        className={`block w-full pl-10 sm:text-sm rounded-md py-2 border ${errors.nombre_empresa ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        placeholder="Mi Empresa S.R.L."
                                        value={formData.nombre_empresa}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.nombre_empresa && <p className="mt-1 text-xs text-red-600">{errors.nombre_empresa}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Corporativo / Contacto</label>
                                <p className="text-xs text-gray-500 mb-1">Email general de la empresa (info, contacto...)</p>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email_empresa"
                                        maxLength={255}
                                        className={`block w-full pl-10 sm:text-sm rounded-md py-2 border ${errors.email_empresa ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        placeholder="contacto@empresa.com"
                                        value={formData.email_empresa}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.email_empresa && <p className="mt-1 text-xs text-red-600">{errors.email_empresa}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                                <input
                                    type="tel"
                                    name="telefono_empresa"
                                    maxLength={20}
                                    className={`mt-1 block w-full sm:text-sm rounded-md py-2 border px-3 ${errors.telefono_empresa ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                    value={formData.telefono_empresa}
                                    onChange={handleChange}
                                    placeholder="+591 70000000"
                                />
                                {errors.telefono_empresa && <p className="mt-1 text-xs text-red-600">{errors.telefono_empresa}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dirección (Opcional)</label>
                                <input
                                    type="text"
                                    name="direccion_empresa"
                                    maxLength={200}
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                                    value={formData.direccion_empresa}
                                    onChange={handleChange}
                                    placeholder="Av. Principal #123"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        maxLength={50}
                                        className={`mt-1 block w-full sm:text-sm rounded-md py-2 border px-3 ${errors.nombre ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        value={formData.nombre}
                                        onChange={handleChange}
                                    />
                                    {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Paterno</label>
                                    <input
                                        type="text"
                                        name="paterno"
                                        maxLength={50}
                                        className={`mt-1 block w-full sm:text-sm rounded-md py-2 border px-3 ${errors.paterno ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                        value={formData.paterno}
                                        onChange={handleChange}
                                    />
                                    {errors.paterno && <p className="mt-1 text-xs text-red-600">{errors.paterno}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Materno (Opcional)</label>
                                <input
                                    type="text"
                                    name="materno"
                                    maxLength={50}
                                    className={`mt-1 block w-full sm:text-sm rounded-md py-2 border px-3 ${errors.materno ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                    value={formData.materno}
                                    onChange={handleChange}
                                />
                                {errors.materno && <p className="mt-1 text-xs text-red-600">{errors.materno}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email del Usuario (Login)</label>
                                <p className="text-xs text-gray-500 mb-1">Este email será tu usuario para iniciar sesión.</p>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        maxLength={255}
                                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm rounded-md py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="juan.perez@empresa.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        maxLength={100}
                                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm rounded-md py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        maxLength={100}
                                        className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm rounded-md py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                     <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center gap-4 mt-6">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                                Atrás
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${step === 1 ? 'ml-auto w-auto' : ''}`}
                        >
                            {loading ? 'Procesando...' : (step === 1 ? 'Siguiente' : 'Registrar Empresa')}
                            {!loading && step === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                            {!loading && step === 2 && <CheckCircle2 className="ml-2 h-4 w-4" />}
                        </button>
                    </div>
                </form>

                 <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
