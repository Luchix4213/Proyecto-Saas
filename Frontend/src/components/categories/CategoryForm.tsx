import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Category, CreateCategoryData, UpdateCategoryData } from '../../services/categoriesService';
import { Save, X, Tag, FileText } from 'lucide-react';

interface CategoryFormProps {
    category?: Category;
    onSubmit: (data: CreateCategoryData | UpdateCategoryData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

interface FormInputs {
    nombre: string;
    descripcion: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel, isLoading = false }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>({
        defaultValues: {
            nombre: category?.nombre || '',
            descripcion: category?.descripcion || ''
        }
    });

    useEffect(() => {
        if (category) {
            reset({
                nombre: category.nombre,
                descripcion: category.descripcion || ''
            });
        }
    }, [category, reset]);

    const submitHandler: SubmitHandler<FormInputs> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Categoría</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        {...register('nombre', { required: 'El nombre es obligatorio' })}
                        className={`pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors ${errors.nombre ? 'border-red-300' : ''}`}
                        placeholder="Ej. Bebidas, Farmacia, Ropa..."
                    />
                </div>
                {errors.nombre && <p className="mt-1 text-xs text-red-600 font-medium">{errors.nombre.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Descripción (Opcional)</label>
                <div className="relative">
                    <div className="absolute top-3 left-4 pointer-events-none">
                        <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                        {...register('descripcion')}
                        className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors min-h-[100px]"
                        placeholder="Breve descripción de la categoría..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
                >
                    <X size={18} />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-teal-500/30"
                >
                    <Save size={18} />
                    {isLoading ? 'Guardando...' : 'Guardar Categoría'}
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;
