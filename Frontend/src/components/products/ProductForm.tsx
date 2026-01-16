import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import type { Product, CreateProductData, UpdateProductData } from '../../services/productsService';
import { categoriesService, type Category } from '../../services/categoriesService';
import { Save, X, Package, FileText, DollarSign, Layers, Tag, Star } from 'lucide-react';

interface ProductFormProps {
    product?: Product;
    onSubmit: (data: CreateProductData | UpdateProductData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

interface FormInputs {
    nombre: string;
    descripcion: string;
    precio: number;
    stock_actual: number;
    stock_minimo: number;
    categoria_id: number;
    destacado: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isLoading = false }) => {
    const { register, handleSubmit, formState: { errors }, reset, control } = useForm<FormInputs>({
        defaultValues: {
            nombre: product?.nombre || '',
            descripcion: product?.descripcion || '',
            precio: product?.precio || 0,
            stock_actual: product?.stock_actual || 0,
            stock_minimo: product?.stock_minimo || 5, // Default warning level
            categoria_id: product?.categoria_id || undefined,
            destacado: product?.destacado || false
        }
    });

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await categoriesService.getAll();
                setCategories(data);
            } catch (error) {
                console.error('Error loading categories', error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (product) {
            reset({
                nombre: product.nombre,
                descripcion: product.descripcion || '',
                precio: Number(product.precio),
                stock_actual: Number(product.stock_actual),
                stock_minimo: Number(product.stock_minimo),
                categoria_id: product.categoria_id,
                destacado: product.destacado
            });
        }
    }, [product, reset]);

    const submitHandler: SubmitHandler<FormInputs> = (data) => {
        // Ensure numbers are sent as numbers
        const payload = {
            ...data,
            precio: Number(data.precio),
            stock_actual: Number(data.stock_actual),
            stock_minimo: Number(data.stock_minimo),
            categoria_id: Number(data.categoria_id)
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Producto</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            {...register('nombre', { required: 'El nombre es obligatorio' })}
                            className={`pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors ${errors.nombre ? 'border-red-300' : ''}`}
                            placeholder="Ej. Paracetamol 500mg"
                        />
                    </div>
                     {errors.nombre && <p className="mt-1 text-xs text-red-600 font-medium">{errors.nombre.message}</p>}
                </div>

                {/* Precio */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Precio de Venta</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register('precio', { required: 'Requerido', min: 0 })}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                        />
                    </div>
                </div>

                {/* Categoria */}
                <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Tag className="h-5 w-5 text-slate-400" />
                        </div>
                        <select
                            {...register('categoria_id', { required: 'Selecciona una categoría' })}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors bg-white"
                        >
                            <option value="">Seleccionar...</option>
                            {categories.map((cat) => (
                                <option key={cat.categoria_id} value={cat.categoria_id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                     </div>
                     {errors.categoria_id && <p className="mt-1 text-xs text-red-600 font-medium">{errors.categoria_id.message}</p>}
                </div>

                {/* Stock Actual */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Stock Actual</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Layers className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="number"
                            {...register('stock_actual', { required: 'Requerido', min: 0 })}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                        />
                    </div>
                </div>

                 {/* Stock Minimo */}
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Alerta Stock Bajo</label>
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Layers className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="number"
                            {...register('stock_minimo', { required: 'Requerido', min: 0 })}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors"
                        />
                        <p className="text-xs text-slate-400 mt-1 ml-1">Avisar cuando quede menos de esta cantidad.</p>
                    </div>
                </div>

                {/* Descripcion */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                    <div className="relative">
                        <div className="absolute top-3 left-4 pointer-events-none">
                            <FileText className="h-5 w-5 text-slate-400" />
                        </div>
                        <textarea
                            {...register('descripcion')}
                            className="pl-11 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm py-2.5 border transition-colors min-h-[80px]"
                            placeholder="Detalles adicionales del producto..."
                        />
                    </div>
                </div>

                {/* Destacado */}
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <Star size={20} />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="destacado" className="font-bold text-slate-800 cursor-pointer block">Producto Destacado</label>
                            <p className="text-xs text-slate-500">Aparecerá en la sección de destacados de tu tienda.</p>
                        </div>
                         <Controller
                            name="destacado"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <input
                                    id="destacado"
                                    type="checkbox"
                                    checked={value}
                                    onChange={onChange}
                                    className="h-5 w-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                                />
                            )}
                        />
                    </div>
                </div>

            </div>

             <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
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
                    {isLoading ? 'Guardando...' : 'Guardar Producto'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
