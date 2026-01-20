import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Phone, Mail, CreditCard, ChevronDown, Rocket, Truck } from 'lucide-react';
import { type Proveedor, type CreateProveedorData } from '../../services/suppliersService';

interface SupplierFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProveedorData) => Promise<void>;
    supplier?: Proveedor | null;
    isLoading?: boolean;
}


interface SupplierFormValues extends CreateProveedorData {
    countryCode?: string;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ isOpen, onClose, onSubmit, supplier, isLoading }) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SupplierFormValues>();
    const countryCode = watch('countryCode', '+591');

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
        if (isOpen) {
            if (supplier) {
                let phone = supplier.telefono || '';
                let code = '+591';

                const foundCode = countryCodes.find(c => phone.startsWith(c.code));
                if (foundCode) {
                    code = foundCode.code;
                    phone = phone.substring(code.length).trim();
                }

                reset({
                    nombre: supplier.nombre,
                    telefono: phone,
                    email: supplier.email || '',
                    datos_pago: supplier.datos_pago || ''
                });
                setValue('countryCode', code); // Custom field for logic
            } else {
                reset({
                    nombre: '',
                    telefono: '',
                    email: '',
                    datos_pago: ''
                });
                setValue('countryCode', '+591');
            }
        }
    }, [isOpen, supplier, reset, setValue]);

    const onFormSubmit = (data: any) => {
        // Construct final phone number
        const finalData: CreateProveedorData = {
            ...data,
            telefono: data.telefono ? `${data.countryCode} ${data.telefono.trim()}` : undefined
        };
        // Remove helper field
        delete (finalData as any).countryCode;

        onSubmit(finalData);
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
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-slate-100">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                            <Truck size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Gestión de cadena de suministro
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

                {/* Form Content */}
                <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0">
                    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">

                        <div className="space-y-2">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre de Empresa <span className="text-red-500">*</span></label>
                            <input
                                {...register('nombre', { required: 'El nombre es obligatorio' })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
                                placeholder="Ej: Distribuidora Central"
                            />
                            {errors.nombre && <span className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1">{errors.nombre.message}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Teléfono</label>
                                <div className="flex gap-2">
                                    <div className="relative w-28 shrink-0">
                                        <select
                                            {...register('countryCode')}
                                            className="w-full appearance-none px-3 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 cursor-pointer"
                                        >
                                            {countryCodes.map((item) => (
                                                <option key={item.code} value={item.code}>
                                                    {item.flag} {item.code}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
                                            <ChevronDown size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <input
                                        type="tel"
                                        {...register('telefono')}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
                                        placeholder="70012345"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
                                        placeholder="contacto@empresa.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Datos de Pago / Notas</label>
                            <div className="relative">
                                <textarea
                                    {...register('datos_pago')}
                                    rows={3}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal resize-none"
                                    placeholder="Cuenta bancaria, NIT, nombre del contacto principal, etc."
                                />
                                <CreditCard className="absolute right-4 top-4 text-slate-300 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {supplier ? 'Guardar Cambios' : 'Registrar Proveedor'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
