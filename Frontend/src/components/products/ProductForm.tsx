import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Image as ImageIcon, Star, Trash2 } from 'lucide-react';
import { productsService, type Product, type CreateProductData } from '../../services/productsService';
import { type Category } from '../../services/categoriesService';

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit: Product | null;
    categories: Category[];
}

export const ProductForm = ({ isOpen, onClose, onSuccess, productToEdit, categories }: ProductFormProps) => {
    const [activeTab, setActiveTab] = useState<'general' | 'images'>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(productToEdit);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Derived state for existing images from backend
    const [existingImages, setExistingImages] = useState(productToEdit?.imagenes || []);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProductData>();

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setCurrentProduct(productToEdit);
                setExistingImages(productToEdit.imagenes || []);
                reset({
                    nombre: productToEdit.nombre,
                    descripcion: productToEdit.descripcion,
                    precio: Number(productToEdit.precio),
                    stock_actual: productToEdit.stock_actual,
                    stock_minimo: productToEdit.stock_minimo,
                    categoria_id: productToEdit.categoria_id,
                    destacado: productToEdit.destacado,
                    slug: productToEdit.slug
                });
            } else {
                setCurrentProduct(null);
                setExistingImages([]);
                reset({
                    destacado: false,
                    stock_actual: 0,
                    stock_minimo: 5
                });
            }
            setActiveTab('general');
            setUploadedImages([]);
            setPreviewUrls([]);
        }
    }, [isOpen, productToEdit, reset]);

    const onSubmit = async (data: CreateProductData) => {
        setIsSubmitting(true);
        try {
            if (currentProduct) {
                // Update
                const updated = await productsService.update(currentProduct.producto_id, data);
                setCurrentProduct(updated);
                alert('Producto actualizado correctamente');
            } else {
                // Create
                const created = await productsService.create(data);
                setCurrentProduct(created);
                setActiveTab('images'); // Auto switch to images
            }
            onSuccess(); // Refresh parent list
        } catch (error) {
            console.error(error);
            alert('Error al guardar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedImages(prev => [...prev, ...files]);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const handleUploadImages = async () => {
        if (!currentProduct) return;
        if (uploadedImages.length === 0) return;

        setIsSubmitting(true);
        try {
            await productsService.uploadImages(currentProduct.producto_id, uploadedImages);
            // Refresh images
            const updatedProduct = await productsService.getById(currentProduct.producto_id);
            setExistingImages(updatedProduct.imagenes || []);
            setUploadedImages([]);
            setPreviewUrls([]);
            alert('Imágenes subidas con éxito');
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Error al subir imágenes');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm('¿Eliminar imagen?')) return;
        try {
            await productsService.deleteImage(imageId);
            setExistingImages(prev => prev.filter(img => img.imagen_id !== imageId));
            onSuccess();
        } catch (error) {
            alert('Error al eliminar imagen');
        }
    };

    const handleSetPrincipal = async (imageId: number) => {
        try {
            await productsService.setPrincipalImage(imageId);
            // Refetch to update all boolean flags locally
            const updated = existingImages.map(img => ({
                ...img,
                es_principal: img.imagen_id === imageId
            }));
            setExistingImages(updated);
            onSuccess();
        } catch (error) {
            alert('Error al cambiar imagen principal');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {activeTab === 'general' ? 'Información básica y precios' : 'Gestión de imágenes'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-6 gap-6">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Información General
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        disabled={!currentProduct}
                        className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'images'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        <ImageIcon size={16} />
                        Imágenes
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'general' ? (
                        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Producto *</label>
                                    <input
                                        {...register('nombre', { required: 'El nombre es obligatorio' })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                                        placeholder="Ej: Camiseta Polo Basic"
                                    />
                                    {errors.nombre && <span className="text-red-500 text-xs mt-1">{errors.nombre.message}</span>}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                                    <textarea
                                        {...register('descripcion')}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none"
                                        placeholder="Detalles del producto, materiales, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Precio (Bs) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Bs</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('precio', { required: true, min: 0 })}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Categoría *</label>
                                    <select
                                        {...register('categoria_id', { required: true, valueAsNumber: true })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categories.map(cat => (
                                            <option key={cat.categoria_id} value={cat.categoria_id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Stock Actual</label>
                                    <input
                                        type="number"
                                        {...register('stock_actual', { min: 0, valueAsNumber: true })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        {...register('stock_minimo', { min: 0, valueAsNumber: true })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                                    />
                                </div>

                                <div className="col-span-2 pt-2">
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            {...register('destacado')}
                                            className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Star size={18} className="text-amber-400 fill-amber-400" />
                                            <span className="font-bold text-slate-700">Producto Destacado</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-teal-600">
                                    <div className="p-4 bg-teal-50 text-teal-600 rounded-full">
                                        <Upload size={32} />
                                    </div>
                                    <p className="font-medium">Arrastra imágenes aquí o haz clic para subir</p>
                                    <p className="text-xs text-slate-400">PNG, JPG hasta 5MB</p>
                                </div>
                            </div>

                            {/* Pending Uploads */}
                            {previewUrls.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-slate-700">Listas para subir ({previewUrls.length})</h3>
                                    <div className="flex gap-4 overflow-x-auto pb-4">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="w-24 h-24 relative rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleUploadImages}
                                        disabled={isSubmitting}
                                        className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Subiendo...' : 'Confirmar Subida'}
                                    </button>
                                </div>
                            )}

                            {/* Existing Images */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-700">Galería Actual</h3>
                                {existingImages.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">No hay imágenes guardadas.</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
                                        {existingImages.map((img) => (
                                            <div key={img.imagen_id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                                <img
                                                    src={`http://localhost:3000${img.url}`}
                                                    alt="Product"
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Indicators */}
                                                {img.es_principal && (
                                                    <div className="absolute top-2 left-2 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                        Principal
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    {!img.es_principal && (
                                                        <button
                                                            onClick={() => handleSetPrincipal(img.imagen_id)}
                                                            className="p-1.5 bg-white text-teal-600 rounded-lg hover:bg-teal-50"
                                                            title="Marcar como Principal"
                                                        >
                                                            <Star size={16} fill="currentColor" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteImage(img.imagen_id)}
                                                        className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'general' && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200/50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => document.getElementById('product-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Guardando...' : (currentProduct ? 'Guardar Cambios' : 'Guardar y Continuar')}
                        </button>
                    </div>
                )}
                {activeTab === 'images' && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors"
                        >
                            Finalizar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
