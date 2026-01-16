import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import type { Tenant, UpdateTenantData } from '../../services/tenantsService';
import { rubrosService, type Rubro } from '../../services/rubrosService';
import { Upload, Building, Phone, MapPin, DollarSign, Clock, Mail, Save, X } from 'lucide-react';

interface TenantFormProps {
    tenant?: Tenant;
    onSubmit: (data: any) => void; // UpdateTenantData | CreateTenantData
    onCancel?: () => void;
    isLoading?: boolean;
    isCreateMode?: boolean;
}

interface FormInputs {
    nombre_empresa: string;
    telefono: string;
    direccion: string;
    moneda: string;
    impuesto_porcentaje: number;
    horario_atencion: string;
    rubros: number[]; // IDs
    logo_file: FileList;
    // Creation fields
    nombre_contacto?: string;
    paterno_contacto?: string;
    password_contacto?: string;
    email?: string;
    email_empresa?: string;
    plan?: string;
}

const TenantForm: React.FC<TenantFormProps> = ({ tenant, onSubmit, onCancel, isLoading = false, isCreateMode = false }) => {
    const { register, handleSubmit, formState: { errors }, watch, control } = useForm<FormInputs>({
        defaultValues: {
            nombre_empresa: tenant?.nombre_empresa || '',
            telefono: tenant?.telefono || '',
            direccion: tenant?.direccion || '',
            moneda: tenant?.moneda || 'BOB',
            impuesto_porcentaje: tenant?.impuesto_porcentaje ? Number(tenant.impuesto_porcentaje) : 0,
            horario_atencion: tenant?.horario_atencion || '',
            rubros: tenant?.rubros?.map((r: any) => r.rubro_id) || [],
            email: tenant?.email || '',
            email_empresa: tenant?.email || '',
        }
    });

    const [previewLogo, setPreviewLogo] = useState<string | null>(tenant?.logo_url ? `http://localhost:3000${tenant.logo_url}` : null);
    const [availableRubros, setAvailableRubros] = useState<Rubro[]>([]);
    const logoFiles = watch('logo_file');

    useEffect(() => {
        const loadRubros = async () => {
            try {
                const data = await rubrosService.getAll();
                setAvailableRubros(data);
            } catch (error) {
                console.error('Error loading rubros', error);
            }
        };
        loadRubros();
    }, []);

    useEffect(() => {
        if (logoFiles && logoFiles.length > 0) {
            const file = logoFiles[0];
            const objectUrl = URL.createObjectURL(file);
            setPreviewLogo(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [logoFiles]);

    const submitHandler: SubmitHandler<FormInputs> = (data) => {
        if (isCreateMode) {
            onSubmit({
                ...data,
                impuesto_porcentaje: Number(data.impuesto_porcentaje),
                logo: data.logo_file && data.logo_file.length > 0 ? data.logo_file[0] : undefined
            });
        } else {
            const updateData: UpdateTenantData = {
                nombre_empresa: data.nombre_empresa,
                telefono: data.telefono,
                direccion: data.direccion,
                moneda: data.moneda,
                impuesto_porcentaje: Number(data.impuesto_porcentaje),
                horario_atencion: data.horario_atencion,
                rubros: data.rubros,
                logo: data.logo_file && data.logo_file.length > 0 ? data.logo_file[0] : undefined
            };
            onSubmit(updateData);
        }
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div className="md:col-span-2 flex flex-col items-center">
                    <div className="relative w-36 h-36 mb-4 rounded-full overflow-hidden border-4 border-slate-100 flex items-center justify-center bg-slate-50 group hover:border-teal-500 transition-all shadow-sm">
                        {previewLogo ? (
                            <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="w-10 h-10 text-slate-300" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            {...register('logo_file')}
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none z-10 backdrop-blur-[1px]">
                            <span className="text-white text-xs font-bold uppercase tracking-wider">Cambiar Logo</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Logotipo de la Empresa</p>
                </div>

                {/* Nombre Empresa */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Empresa</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            {...register('nombre_empresa', { required: 'El nombre de la empresa es obligatorio' })}
                            className={`pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors ${errors.nombre_empresa ? 'border-red-300' : ''}`}
                            placeholder="Ej. Mi Tienda S.R.L."
                        />
                    </div>
                    {errors.nombre_empresa && <p className="mt-1 text-xs text-red-600 font-medium">{errors.nombre_empresa.message}</p>}
                </div>

                {/* Email Empresa */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Corporativo</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            {...register('email_empresa')}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                            placeholder="contacto@empresa.com"
                        />
                    </div>
                </div>

                {/* Telefono */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono / WhatsApp</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            {...register('telefono')}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                            placeholder="Ej. 77712345"
                        />
                    </div>
                </div>

                {/* Direccion */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Física</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            {...register('direccion')}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                            placeholder="Ej. Av. Siempre Viva 123"
                        />
                    </div>
                </div>

                {/* Moneda */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Moneda Principal</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-slate-400" />
                        </div>
                        <select
                            {...register('moneda')}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors bg-white"
                        >
                            <option value="BOB">Boliviano (BOB)</option>
                            <option value="USD">Dólar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>
                </div>

                {/* Impuesto */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Impuesto Aplicable (%)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold text-lg">%</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register('impuesto_porcentaje')}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                            placeholder="Ej. 13" // IVA
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 ml-1">Porcentaje que se aplicará a todas las ventas.</p>
                </div>

                {/* Horario */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Horario de Atención</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            {...register('horario_atencion')}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                            placeholder="Ej. Lun - Vie 08:30 - 18:30"
                        />
                    </div>
                </div>

                {/* Rubros (Multi-select) */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Rubro / Categoría (Seleccione al menos uno)</label>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {/* Controller for checkboxes */}
                            <Controller
                                name="rubros"
                                control={control}
                                rules={{ required: 'Al menos un rubro es requerido' }}
                                render={({ field }) => (
                                    <>
                                        {availableRubros.map((rubro) => (
                                            <label key={rubro.rubro_id} className="flex items-center space-x-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    value={rubro.rubro_id}
                                                    checked={field.value?.includes(rubro.rubro_id)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        const value = Number(e.target.value);
                                                        if (checked) {
                                                            field.onChange([...(field.value || []), value]);
                                                        } else {
                                                            field.onChange((field.value || []).filter((id: number) => id !== value));
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 transition-colors"
                                                />
                                                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{rubro.nombre}</span>
                                            </label>
                                        ))}
                                    </>
                                )}
                            />
                        </div>
                        {errors.rubros && <p className="mt-2 text-xs text-red-600 font-medium">{errors.rubros.message}</p>}
                    </div>
                </div>

                {isCreateMode && (
                    <>
                        <div className="md:col-span-2 pt-6 mt-2 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Datos del Administrador</h3>
                            <p className="text-slate-500 text-sm mb-6">Información para crear la cuenta principal del negocio.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Contacto</label>
                                    <input
                                        type="text"
                                        {...register('nombre_contacto', { required: isCreateMode ? 'Requerido' : false })}
                                        className="block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Apellido Contacto</label>
                                    <input
                                        type="text"
                                        {...register('paterno_contacto', { required: isCreateMode ? 'Requerido' : false })}
                                        className="block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email (Usuario Admin)</label>
                                    <input
                                        type="email"
                                        {...register('email', { required: 'Requerido' })}
                                        className="block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        {...register('password_contacto', { required: isCreateMode ? 'Requerido' : false, minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                                        className="block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                                    />
                                    {errors.password_contacto && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password_contacto.message}</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
                    >
                        <X size={18} />
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-teal-500/30"
                >
                    <Save size={18} />
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};

export default TenantForm;
