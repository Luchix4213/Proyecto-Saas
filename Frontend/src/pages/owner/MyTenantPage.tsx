import { useEffect, useState } from 'react';
import { tenantsService } from '../../services/tenantsService';
import type { Tenant, UpdateTenantData } from '../../services/tenantsService';
import { getImageUrl } from '../../utils/imageUtils';
import { Save, Building2, Phone, Mail, MapPin, Upload, DollarSign, Store, Tag, AlertTriangle, ChevronDown, Facebook, Instagram, Youtube, Video, Map } from 'lucide-react';
import { ScheduleEditor } from '../../components/tenants/ScheduleEditor';
import { MapPicker } from '../../components/common/MapPicker';
import { useForm, Controller } from 'react-hook-form';
import { rubrosService, type Rubro } from '../../services/rubrosService';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { useToast } from '../../context/ToastContext';

interface FormInputs {
    nombre_empresa: string;
    email: string;
    telefono: string;
    direccion: string;
    moneda: string;
    impuesto_porcentaje: number;
    horario_atencion: string;
    rubros: number[];
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    google_maps_url?: string;
    latitud?: number;
    longitud?: number;
}

const MyTenantPage = () => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Global UI State
    const { addToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: DialogType;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    // Auxiliary state
    const [availableRubros, setAvailableRubros] = useState<Rubro[]>([]);
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    // Country code state
    const [countryCode, setCountryCode] = useState('+591');

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

    const { register, handleSubmit, formState: { errors }, control, reset, watch, getValues } = useForm<FormInputs>();

    useEffect(() => {
        fetchTenant();
        loadRubros();
    }, []);

    const fetchTenant = async () => {
        try {
            setLoading(true);
            const data = await tenantsService.getMyTenant();
            setTenant(data);

            // Pre-fill form
            let phone = data.telefono || '';
            let code = '+591';

            // Try to find if the phone starts with any known country code
            const foundCode = countryCodes.find(c => phone.startsWith(c.code));
            if (foundCode) {
                code = foundCode.code;
                phone = phone.substring(code.length).trim();
            }

            setCountryCode(code);

            reset({
                nombre_empresa: data.nombre_empresa,
                email: data.email || '',
                telefono: phone,
                direccion: data.direccion || '',
                moneda: data.moneda,
                impuesto_porcentaje: Number(data.impuesto_porcentaje),
                horario_atencion: data.horario_atencion || '',
                rubros: data.rubros?.map((r: any) => r.rubro_id) || [],
                facebook_url: data.facebook_url || '',
                instagram_url: data.instagram_url || '',
                youtube_url: data.youtube_url || '',
                tiktok_url: data.tiktok_url || '',
                google_maps_url: data.google_maps_url || '',
                latitud: data.latitud ? Number(data.latitud) : undefined,
                longitud: data.longitud ? Number(data.longitud) : undefined,
            });

            if (data.logo_url) {
                setPreviewLogo(getImageUrl(data.logo_url));
            }
            if (data.banner_url) {
                setPreviewBanner(getImageUrl(data.banner_url));
            }

        } catch (err) {
            addToast('Error al cargar la información de la empresa.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRubros = async () => {
        try {
            const data = await rubrosService.getAll();
            setAvailableRubros(data);
        } catch (error) {
            console.error('Error loading rubros', error);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewLogo(objectUrl);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewBanner(objectUrl);
        }
    };

    const onPreSubmit = () => {
        setConfirmConfig({
            isOpen: true,
            title: 'Confirmar Cambios',
            message: '¿Estás seguro de que deseas actualizar la información de tu empresa? Estos cambios serán visibles inmediatamente.',
            type: 'warning',
            onConfirm: executeUpdate
        });
    };

    const executeUpdate = async () => {
        if (!tenant) return;
        const data = getValues();

        setConfirmConfig(prev => ({ ...prev, isOpen: false }));

        try {
            setSaving(true);

            const updateData: UpdateTenantData = {
                ...data,
                telefono: data.telefono ? `${countryCode} ${data.telefono}` : undefined,
                impuesto_porcentaje: Number(data.impuesto_porcentaje),
                logo: logoFile || undefined,
                banner: bannerFile || undefined
            };

            const updated = await tenantsService.update(tenant.tenant_id, updateData);
            setTenant(updated);
            addToast('Información actualizada correctamente', 'success');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al actualizar la información.';
            addToast(message, 'error');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                <p className="text-slate-400 font-medium">Cargando perfil de empresa...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-[80vh] w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            {/* Ambient Background */}
            <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <AestheticHeader
                title="Mi Empresa"
                description="Configuración de identidad y operaciones de tu negocio."
                icon={Store}
                iconColor="from-indigo-500 to-purple-600"
            />

            <form onSubmit={handleSubmit(onPreSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Left Column: Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group">
                        {/* Banner Upload Area */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 group/banner cursor-pointer overflow-hidden">
                            {previewBanner ? (
                                <img
                                    src={previewBanner}
                                    alt="Banner"
                                    className="w-full h-full object-cover opacity-80 group-hover/banner:opacity-50 transition-all duration-700 group-hover/banner:scale-110"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 transition-transform duration-700 group-hover/banner:scale-110"></div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity z-10">
                                <div className="bg-black/40 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                                    <Upload size={12} /> Cambiar Portada
                                </div>
                                <span className="text-white/80 text-[10px] bg-black/30 px-2 py-0.5 rounded mt-1 backdrop-blur-sm">
                                    Recomendado: 1200x400px
                                </span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                        </div>

                        <div className="pt-16 pb-8 px-6 text-center relative">
                            {/* Logo Upload */}
                            <div className="relative inline-block mb-4 group/logo cursor-pointer">
                                <div className="h-32 w-32 bg-white rounded-2xl flex items-center justify-center text-4xl font-bold text-slate-300 shadow-xl border-4 border-white overflow-hidden relative z-10 mx-auto">
                                    {previewLogo ? (
                                        <img src={previewLogo} alt="Logo" className="w-full h-full object-cover group-hover/logo:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Building2 size={48} />
                                    )}

                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all duration-300 backdrop-blur-[2px] z-20">
                                        <Upload className="text-white mb-1" size={24} />
                                        <span className="text-white text-xs font-bold uppercase tracking-wider">Cambiar</span>
                                        <span className="text-white/80 text-[10px] mt-1">Recomendado: 400x400px</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 break-words">
                                {watch('nombre_empresa') || 'Nombre de tu Empresa'}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm mt-1 mb-4">{tenant?.email}</p>

                            <div className="flex justify-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide
                                    ${tenant?.estado === 'ACTIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        tenant?.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-red-50 text-red-600 border-red-100'}`}>
                                    {tenant?.estado}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide">
                                    Plan {tenant?.plan?.nombre_plan || 'FREE'}
                                </span>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Resumen de Suscripción</h4>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-slate-600">Costo Mensual</span>
                                <span className="font-bold text-slate-800">{tenant?.moneda} {tenant?.plan?.precio_mensual}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Próximo cobro</span>
                                <span className="text-slate-500">Manual</span>
                            </div>
                        </div>
                    </div>

                    {/* Rubros Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Tag size={18} className="text-indigo-500" />
                            Rubros y Categorías
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <Controller
                                name="rubros"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        {availableRubros.map(rubro => {
                                            const isSelected = field.value?.includes(rubro.rubro_id);
                                            return (
                                                <div
                                                    key={rubro.rubro_id}
                                                    onClick={() => {
                                                        const newValue = isSelected
                                                            ? field.value.filter(id => id !== rubro.rubro_id)
                                                            : [...(field.value || []), rubro.rubro_id];
                                                        field.onChange(newValue);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all select-none
                                                        ${isSelected
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-500'}`}
                                                >
                                                    {rubro.nombre}
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Form */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                        <div className="p-8 space-y-8">
                            {/* Section: Basic Info */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    Información General
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Comercial</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                {...register('nombre_empresa', { required: 'Requerido' })}
                                                className={`w-full pl-4 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 ${errors.nombre_empresa ? 'border-red-300 ring-red-500/10' : 'border-slate-200'}`}
                                                placeholder="Ej. Mi Tienda"
                                            />
                                            {errors.nombre_empresa && (
                                                <p className="mt-1.5 ml-1 text-xs font-bold text-red-500 flex items-center gap-1 animate-fade-in">
                                                    <AlertTriangle size={12} />
                                                    {errors.nombre_empresa.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email de la Empresa</label>
                                        <div className="relative">
                                            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                                            <input
                                                type="email"
                                                {...register('email', { required: 'Requerido' })}
                                                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 ${errors.email ? 'border-red-300 ring-red-500/10' : 'border-slate-200'}`}
                                                placeholder="contacto@empresa.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1.5 ml-1 text-xs font-bold text-red-500 flex items-center gap-1 animate-fade-in">
                                                    <AlertTriangle size={12} />
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Teléfono / WhatsApp</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {/* Country Code Selector */}
                                            <div className="relative w-full sm:w-32 shrink-0">
                                                <select
                                                    value={countryCode}
                                                    onChange={(e) => setCountryCode(e.target.value)}
                                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 pl-3 pr-8 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer transition-all font-medium"
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
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    {...register('telefono')}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                                    placeholder="777123456"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dirección Física</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                {...register('direccion')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                                placeholder="Av. Principal #123"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Config */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    Configuración Financiera
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Moneda Principal</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <select
                                                {...register('moneda')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 appearance-none"
                                            >
                                                <option value="BOB">Boliviano (BOB)</option>
                                                <option value="USD">Dólar Americano (USD)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Impuesto Base (%)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('impuesto_porcentaje')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                                placeholder="13.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Smart Schedule */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    Horario de Atención
                                </h3>

                                <Controller
                                    name="horario_atencion"
                                    control={control}
                                    render={({ field }) => (
                                        <ScheduleEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {/* Section: Social Media & Location */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                    Redes Sociales y Ubicación
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Facebook</label>
                                            <div className="relative">
                                                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    {...register('facebook_url')}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                    placeholder="https://facebook.com/..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Instagram</label>
                                            <div className="relative">
                                                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    {...register('instagram_url')}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-medium text-slate-700"
                                                    placeholder="https://instagram.com/..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">YouTube</label>
                                            <div className="relative">
                                                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    {...register('youtube_url')}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-slate-700"
                                                    placeholder="https://youtube.com/..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">TikTok</label>
                                            <div className="relative">
                                                <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    {...register('tiktok_url')}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-800 outline-none transition-all font-medium text-slate-700"
                                                    placeholder="https://tiktok.com/..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 group">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Ubicación</label>
                                            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                                                Selecciona en el mapa
                                            </span>
                                        </div>

                                        <Controller
                                            name="latitud"
                                            control={control}
                                            render={({ field: { value: lat, onChange: setLat } }) => (
                                                <Controller
                                                    name="longitud"
                                                    control={control}
                                                    render={({ field: { value: lng, onChange: setLng } }) => (
                                                        <MapPicker
                                                            lat={lat || 0}
                                                            lng={lng || 0}
                                                            onChange={(newLat, newLng) => {
                                                                setLat(newLat);
                                                                setLng(newLng);
                                                                // Auto-generate Google Maps URL
                                                                const mapLink = `https://www.google.com/maps?q=${newLat},${newLng}`;
                                                                reset({ ...getValues(), latitud: newLat, longitud: newLng, google_maps_url: mapLink });
                                                            }}
                                                        />
                                                    )}
                                                />
                                            )}
                                        />

                                        <div className="relative mt-2">
                                            <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                {...register('google_maps_url')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium text-slate-700 text-sm"
                                                placeholder="https://goo.gl/maps/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-xs text-slate-400 text-center sm:text-left order-2 sm:order-1">
                                Última actualización: {new Date().toLocaleDateString()}
                            </p>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 border border-transparent rounded-xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 order-1 sm:order-2"
                            >
                                <Save size={18} className="group-hover:scale-110 transition-transform" />
                                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Premium Confirm Dialog */}
            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default MyTenantPage;
