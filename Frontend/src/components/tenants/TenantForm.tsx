import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Tenant, UpdateTenantData } from '../../services/tenantsService';
import { Upload, Building, Phone, MapPin, DollarSign, Clock, Mail } from 'lucide-react';

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
    rubro: string;
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
    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormInputs>({
        defaultValues: {
            nombre_empresa: tenant?.nombre_empresa || '',
            telefono: tenant?.telefono || '',
            direccion: tenant?.direccion || '',
            moneda: tenant?.moneda || 'BOB',
            impuesto_porcentaje: tenant?.impuesto_porcentaje ? Number(tenant.impuesto_porcentaje) : 0,
            horario_atencion: tenant?.horario_atencion || '',
            rubro: tenant?.rubro || '',
            email: tenant?.email || '',
            email_empresa: tenant?.email || '',
        }
    });

    const [previewLogo, setPreviewLogo] = useState<string | null>(tenant?.logo_url ? `http://localhost:3000${tenant.logo_url}` : null);
    const logoFiles = watch('logo_file');

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
                rubro: data.rubro,
                logo: data.logo_file && data.logo_file.length > 0 ? data.logo_file[0] : undefined
            };
            onSubmit(updateData);
        }
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="md:col-span-2 flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group hover:border-indigo-500 transition-colors">
                        {previewLogo ? (
                            <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="w-8 h-8 text-gray-400" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            {...register('logo_file')}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Cambiar Logo</span>
                        </div>
                    </div>
                </div>

                {/* Nombre Empresa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('nombre_empresa', { required: 'El nombre de la empresa es obligatorio' })}
                            className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border ${errors.nombre_empresa ? 'border-red-300' : ''}`}
                            placeholder="Ej. Mi Tienda S.R.L."
                        />
                    </div>
                    {errors.nombre_empresa && <p className="mt-1 text-sm text-red-600">{errors.nombre_empresa.message}</p>}
                </div>

                {/* Email Empresa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de la Empresa</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            {...register('email_empresa')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="contacto@empresa.com"
                        />
                    </div>
                </div>

                {/* Telefono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('telefono')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="Ej. 77712345"
                        />
                    </div>
                </div>

                {/* Direccion */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('direccion')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="Ej. Av. Siempre Viva 123"
                        />
                    </div>
                </div>

                {/* Moneda */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda Principal</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            {...register('moneda')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="BOB">Boliviano (BOB)</option>
                            <option value="USD">Dólar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>
                </div>

                {/* Impuesto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Impuesto (%)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-bold text-lg">%</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register('impuesto_porcentaje')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="Ej. 13" // IVA
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Porcentaje aplicado a las ventas.</p>
                </div>

                {/* Horario */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horario de Atención</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('horario_atencion')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="Ej. Lun-Vie 08:00 - 18:00"
                        />
                    </div>
                </div>

                {/* Rubro */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rubro / Categoría de Negocio</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('rubro')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="Ej. Juguetes, Farmacia, Ropa"
                        />
                    </div>
                </div>

                {isCreateMode && (
                    <>
                        <div className="md:col-span-2 border-t pt-4 mt-4">
                            <h3 className="text-lg font-medium text-gray-900">Datos del Administrador Inicial</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Contacto</label>
                            <input
                                type="text"
                                {...register('nombre_contacto', { required: isCreateMode ? 'Requerido' : false })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Contacto</label>
                            <input
                                type="text"
                                {...register('paterno_contacto', { required: isCreateMode ? 'Requerido' : false })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Usuario Admin)</label>
                            <input
                                type="email"
                                {...register('email', { required: 'Requerido' })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="password"
                                {...register('password_contacto', { required: isCreateMode ? 'Requerido' : false, minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            />
                            {errors.password_contacto && <p className="mt-1 text-sm text-red-600">{errors.password_contacto.message}</p>}
                        </div>

                    </>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};

export default TenantForm;
