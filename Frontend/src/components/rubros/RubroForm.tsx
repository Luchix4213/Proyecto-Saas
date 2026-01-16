import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface RubroFormProps {
    initialData?: {
        nombre: string;
        descripcion?: string;
    };
    onSubmit: (data: { nombre: string; descripcion?: string }) => Promise<void>;
    isLoading: boolean;
    onCancel: () => void;
}

export const RubroForm = ({ initialData, onSubmit, isLoading, onCancel }: RubroFormProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            nombre: initialData?.nombre || '',
            descripcion: initialData?.descripcion || ''
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Rubro <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('nombre', { required: 'El nombre es requerido' })}
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="Ej. Restaurante, Farmacia..."
                />
                {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción
                </label>
                <textarea
                    {...register('descripcion')}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
                    placeholder="Descripción breve del rubro..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    {initialData ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
};
