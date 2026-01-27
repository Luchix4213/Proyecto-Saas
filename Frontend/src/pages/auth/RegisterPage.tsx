import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { rubrosService, type Rubro } from '../../services/rubrosService';
import { Building2, User, Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, MapPin, Phone, ChevronDown } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const RegisterPage = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [loadingRubros, setLoadingRubros] = useState(true);

    // Changed from single string to object for field-specific errors
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRubroDropdown, setShowRubroDropdown] = useState(false);

    // Default country code
    const [countryCode, setCountryCode] = useState('+591');

    const [formData, setFormData] = useState({
        nombre_empresa: '',
        telefono_empresa: '',
        email_empresa: '',
        direccion_empresa: '',
        nombre: '',
        paterno: '',
        materno: '',
        selectedRubros: [] as number[], // IDs of selected rubros
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Country codes data
    const countryCodes = [
        { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
        { code: '+54', country: 'Argentina', flag: '🇦🇷' },
        { code: '+51', country: 'Perú', flag: '🇵🇪' },
        { code: '+56', country: 'Chile', flag: '🇨🇱' },
        { code: '+57', country: 'Colombia', flag: '🇨🇴' },
        { code: '+52', country: 'México', flag: '🇲🇽' },
        { code: '+1', country: 'USA', flag: '🇺🇸' },
        { code: '+34', country: 'España', flag: '🇪🇸' },
    ];

    useEffect(() => {
        const fetchRubros = async () => {
            try {
                const data = await rubrosService.getAll();
                // Filter active rubros only
                setRubros(data.filter(r => r.estado === 'ACTIVO'));
            } catch (error) {
                console.error('Error fetching rubros:', error);
                setGlobalError('No se pudieron cargar los rubros. Por favor recarga la página.');
            } finally {
                setLoadingRubros(false);
            }
        };
        fetchRubros();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleRubroToggle = (rubroId: number) => {
        setFormData(prev => {
            const currentSelected = prev.selectedRubros;
            if (currentSelected.includes(rubroId)) {
                return { ...prev, selectedRubros: currentSelected.filter(id => id !== rubroId) };
            } else {
                return { ...prev, selectedRubros: [...currentSelected, rubroId] };
            }
        });
        if (errors.rubro) {
            setErrors({ ...errors, rubro: '' });
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        const phoneRegex = /^[0-9\s-]{6,15}$/; // Basic phone validation (only numbers part)

        if (!formData.nombre_empresa.trim()) newErrors.nombre_empresa = 'El nombre de la empresa es requerido';

        if (!formData.email_empresa.trim()) {
            newErrors.email_empresa = 'El email de la empresa es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email_empresa)) {
            newErrors.email_empresa = 'Formato de email inválido';
        }

        if (formData.telefono_empresa.trim() && !phoneRegex.test(formData.telefono_empresa)) {
            newErrors.telefono_empresa = 'Formato de teléfono inválido';
        }

        if (formData.selectedRubros.length === 0) {
            newErrors.rubro = 'Selecciona al menos un rubro';
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
            // Prepare payload
            const registerPayload = {
                nombre_empresa: trimmedData.nombre_empresa,
                telefono_empresa: trimmedData.telefono_empresa ? `${countryCode} ${trimmedData.telefono_empresa}` : undefined,
                email_empresa: trimmedData.email_empresa,
                direccion_empresa: trimmedData.direccion_empresa,
                rubros: trimmedData.selectedRubros,
                nombre: trimmedData.nombre,
                paterno: trimmedData.paterno,
                materno: trimmedData.materno,
                email: trimmedData.email,
                password: trimmedData.password
            };

            await authService.register(registerPayload);
            addToast('Registro exitoso. Tu cuenta ha sido creada y está pendiente de aprobación por el administrador.', 'success');
            navigate('/login');
        } catch (err: any) {
            setGlobalError(err.response?.data?.message || err.response?.data?.error || 'Error al registrar la empresa');
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

            <div className={`w-full relative z-10 p-6 animate-fade-in-up transition-all duration-500 ${step === 1 ? 'max-w-2xl' : 'max-w-xl'}`}>
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nombre de la Empresa <span className="text-red-500">*</span></label>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Empresa <span className="text-red-500">*</span></label>
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

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Teléfono</label>
                                        <div className="flex gap-2">
                                            {/* Country Code Selector */}
                                            <div className="relative w-28 shrink-0">
                                                <select
                                                    value={countryCode}
                                                    onChange={(e) => setCountryCode(e.target.value)}
                                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-3 pr-8 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer hover:bg-white transition-colors"
                                                >
                                                    {countryCodes.map((item) => (
                                                        <option key={item.code} value={item.code}>
                                                            {item.flag} {item.code}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>

                                            <div className="relative w-full">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="telefono_empresa"
                                                    maxLength={15}
                                                    className={`block w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all placeholder-slate-400 ${errors.telefono_empresa
                                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                            : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500 hover:bg-white'
                                                        }`}
                                                    value={formData.telefono_empresa}
                                                    onChange={handleChange}
                                                    placeholder="70012345"
                                                />
                                            </div>
                                        </div>
                                        {errors.telefono_empresa && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.telefono_empresa}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Rubros (Categorías de Negocio) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowRubroDropdown(!showRubroDropdown)}
                                            className={`w-full bg-slate-50 border rounded-xl text-left px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all flex justify-between items-center ${errors.rubro ? 'border-red-300 ring-red-500' : 'border-slate-200 hover:bg-white'}`}
                                        >
                                            <span className={formData.selectedRubros.length ? 'text-slate-800' : 'text-slate-400'}>
                                                {formData.selectedRubros.length > 0
                                                    ? `${formData.selectedRubros.length} rubro(s) seleccionado(s)`
                                                    : 'Selecciona los rubros de tu empresa'}
                                            </span>
                                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showRubroDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showRubroDropdown && (
                                            <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-teal-500/20 scrollbar-track-transparent">
                                                {loadingRubros ? (
                                                    <div className="p-4 text-center text-slate-400 text-sm">Cargando rubros...</div>
                                                ) : rubros.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-400 text-sm">No hay rubros disponibles</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 gap-1">
                                                        {rubros.map((rubro) => (
                                                            <label
                                                                key={rubro.rubro_id}
                                                                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${formData.selectedRubros.includes(rubro.rubro_id) ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mr-3"
                                                                    checked={formData.selectedRubros.includes(rubro.rubro_id)}
                                                                    onChange={() => handleRubroToggle(rubro.rubro_id)}
                                                                />
                                                                <span className="text-sm font-medium">{rubro.nombre}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Chips */}
                                    {formData.selectedRubros.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.selectedRubros.map(id => {
                                                const rubro = rubros.find(r => r.rubro_id === id);
                                                return rubro ? (
                                                    <span key={id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-200">
                                                        {rubro.nombre}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRubroToggle(id)}
                                                            className="ml-1.5 text-teal-500 hover:text-teal-800 focus:outline-none"
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    {errors.rubro && <p className="mt-1 text-xs font-semibold text-red-500 ml-1">{errors.rubro}</p>}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nombre <span className="text-red-500">*</span></label>
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
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Apellido <span className="text-red-500">*</span></label>
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email (Usuario) <span className="text-red-500">*</span></label>
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Contraseña <span className="text-red-500">*</span></label>
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Confirmar Contraseña <span className="text-red-500">*</span></label>
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
