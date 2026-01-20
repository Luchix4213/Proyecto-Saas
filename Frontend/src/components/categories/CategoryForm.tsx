import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Category, CreateCategoryData, UpdateCategoryData } from '../../services/categoriesService';
import { Save, X, Tag, FileText } from 'lucide-react';

interface CategoryFormProps {
    isOpen: boolean;
    category?: Category;
    onSubmit: (data: CreateCategoryData | UpdateCategoryData) => Promise<void>;
    onClose: () => void;
    isLoading?: boolean;
}

interface FormInputs {
    nombre: string;
    descripcion: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ isOpen, category, onSubmit, onClose, isLoading = false }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>({
        defaultValues: {
            nombre: category?.nombre || '',
            descripcion: category?.descripcion || ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                nombre: category?.nombre || '',
                descripcion: category?.descripcion || ''
            });
        }
    }, [isOpen, category, reset]);

    const submitHandler: SubmitHandler<FormInputs> = async (data) => {
        await onSubmit(data); // Ensure we wait if it's async, though react-hook-form handles it
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

                {/* Header: Integrated with Page Style */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-teal-500/30">
                            <Tag size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {category ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {category ? 'Modificar datos' : 'Agregar al catálogo'}
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

                {/* Form Content: Scrollable Area */}
                <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col flex-1 min-h-0">
                    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre de la Categoría</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                    <Tag size={20} />
                                </div>
                                <input
                                    type="text"
                                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                                    className={`pl-12 block w-full px-5 py-3.5 bg-slate-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all font-bold text-slate-700 ${errors.nombre ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-teal-500/10 focus:border-teal-500'}`}
                                    placeholder="Ej. Bebidas, Farmacia..."
                                />
                            </div>
                            {errors.nombre && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider mt-1 ml-1">{errors.nombre.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción (Opcional)</label>
                            <div className="relative group">
                                <div className="absolute top-4 left-4 pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <textarea
                                    {...register('descripcion')}
                                    className="pl-12 block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 min-h-[120px] resize-none"
                                    placeholder="Breve descripción para identificar esta categoría..."
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions: Sticky at Bottom */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] border border-transparent hover:border-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                        >
                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                            <span>{isLoading ? 'Guardando...' : 'Guardar Categoría'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
