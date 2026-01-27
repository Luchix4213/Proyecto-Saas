import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Image as ImageIcon, Star, Trash2, ShoppingBag } from 'lucide-react';
import { productsService, type Product, type CreateProductData } from '../../services/productsService';
import { type Category } from '../../services/categoriesService';
import { suppliersService, type Proveedor } from '../../services/suppliersService';
import { getImageUrl } from '../../utils/imageUtils';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog, type DialogType } from '../common/ConfirmDialog';

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit: Product | null;
    categories: Category[];
}

export const ProductForm = ({ isOpen, onClose, onSuccess, productToEdit, categories }: ProductFormProps) => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'general' | 'images'>('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(productToEdit);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);

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
        onConfirm: () => {},
    });

    // Derived state for existing images from backend
    const [existingImages, setExistingImages] = useState(productToEdit?.imagenes || []);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProductData>();

     useEffect(() => {
        const fetchSuppliers = async () => {
             try {
                const data = await suppliersService.getAll();
                setSuppliers(data.filter(s => s.estado === 'ACTIVO'));
             } catch (error) {
                 console.error("Failed to load suppliers");
             }
        };
        fetchSuppliers();
    }, []);

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
                addToast('Producto actualizado correctamente', 'success');
            } else {
                // Create
                const created = await productsService.create(data);
                setCurrentProduct(created);
                setActiveTab('images'); // Auto switch to images
                addToast('Producto creado. Ahora puedes subir imágenes.', 'success');
            }
            onSuccess(); // Refresh parent list
        } catch (error) {
            console.error(error);
            addToast('Error al guardar el producto', 'error');
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
            addToast('Imágenes subidas con éxito', 'success');
            onSuccess();
        } catch (error) {
            console.error(error);
            addToast('Error al subir imágenes', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteImage = (imageId: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Eliminar Imagen',
            message: '¿Estás seguro de eliminar esta imagen del producto?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await productsService.deleteImage(imageId);
                    setExistingImages(prev => prev.filter(img => img.imagen_id !== imageId));
                    addToast('Imagen eliminada', 'success');
                    onSuccess();
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    addToast('Error al eliminar imagen', 'error');
                }
            }
        });
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
            addToast('Imagen principal actualizada', 'success');
            onSuccess();
        } catch (error) {
            addToast('Error al cambiar imagen principal', 'error');
        }
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
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-slate-100">

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-teal-500/30">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {activeTab === 'general' ? 'Información básica y precios' : 'Gestión de galería'}
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

                {/* Tabs */}
                <div className="px-8 pb-0 border-b border-slate-100 bg-white flex gap-6 shrink-0 z-10">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`relative py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'general' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Información General
                        {activeTab === 'general' && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        disabled={!currentProduct}
                        className={`relative py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === 'images' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        <ImageIcon size={16} />
                        Galería
                        {activeTab === 'images' && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-t-full"></div>}
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
                    <div className="p-8">
                        {activeTab === 'general' ? (
                            <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre del Producto</label>
                                        <input
                                            {...register('nombre', { required: 'El nombre es obligatorio' })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
                                            placeholder="Ej: Camiseta Polo Basic"
                                        />
                                        {errors.nombre && <span className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1">{errors.nombre.message}</span>}
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción</label>
                                        <textarea
                                            {...register('descripcion')}
                                            rows={3}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal resize-none"
                                            placeholder="Detalles del producto, materiales, etc."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Precio (Bs)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">Bs</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register('precio', { required: true, min: 0 })}
                                                className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Categoría</label>
                                        <div className="relative">
                                            <select
                                                {...register('categoria_id', { required: true, valueAsNumber: true })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.categoria_id} value={cat.categoria_id}>{cat.nombre}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-90"><path d="m9 18 6-6-6-6"/></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Proveedor (Opcional)</label>
                                        <div className="relative">
                                            <select
                                                {...register('proveedor_id', { valueAsNumber: true })}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                            >
                                                <option value="">Ninguno</option>
                                                {suppliers.map(sup => (
                                                    <option key={sup.proveedor_id} value={sup.proveedor_id}>{sup.nombre}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rotate-90"><path d="m9 18 6-6-6-6"/></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Stock Actual</label>
                                        <input
                                            type="number"
                                            {...register('stock_actual', { min: 0, valueAsNumber: true })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Stock Mínimo</label>
                                        <input
                                            type="number"
                                            {...register('stock_minimo', { min: 0, valueAsNumber: true })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 pt-2">
                                        <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-teal-200 transition-all group">
                                            <input
                                                type="checkbox"
                                                {...register('destacado')}
                                                className="w-6 h-6 text-teal-600 rounded-lg focus:ring-teal-500 border-slate-300"
                                            />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <Star size={18} className="text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
                                                    <span className="font-bold text-slate-800">Producto Destacado</span>
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium">Este producto aparecerá en las secciones principales</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                {/* Upload Area */}
                                <div className="border-3 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:bg-slate-50 hover:border-teal-300 transition-all relative group cursor-pointer bg-slate-50/50">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center gap-4 text-slate-500 group-hover:text-teal-600 transition-colors">
                                        <div className="p-5 bg-white shadow-xl shadow-slate-200/50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                            <Upload size={32} className="text-teal-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-slate-700">Arrastra imágenes o haz clic</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG hasta 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Uploads */}
                                {previewUrls.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Listas para subir ({previewUrls.length})</h3>
                                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                            {previewUrls.map((url, idx) => (
                                                <div key={idx} className="w-28 h-28 relative rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-sm group">
                                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">Pendiente</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleUploadImages}
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-lg shadow-teal-500/20"
                                        >
                                            {isSubmitting ? 'Subiendo...' : 'Confirmar Subida de Imágenes'}
                                        </button>
                                    </div>
                                )}

                                {/* Existing Images */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Galería Actual</h3>
                                    {existingImages.length === 0 ? (
                                        <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                                            <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-sm font-bold text-slate-400">No hay imágenes en la galería.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {existingImages.map((img) => (
                                                <div key={img.imagen_id} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                                    <img
                                                        src={getImageUrl(img.url)}
                                                        alt="Product"
                                                        className="w-full h-full object-cover"
                                                    />

                                                    {/* Indicators */}
                                                    {img.es_principal && (
                                                        <div className="absolute top-2 left-2 bg-teal-600/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shadow-sm z-10">
                                                            Principal
                                                        </div>
                                                    )}

                                                    {/* Actions Overlay */}
                                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                                        {!img.es_principal && (
                                                            <button
                                                                onClick={() => handleSetPrincipal(img.imagen_id)}
                                                                className="px-3 py-1.5 bg-white text-teal-600 rounded-xl hover:bg-teal-50 text-[10px] font-bold uppercase tracking-wider shadow-lg transform hover:-translate-y-0.5 transition-all w-24"
                                                            >
                                                                Hacer Principal
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteImage(img.imagen_id)}
                                                            className="p-1.5 bg-white text-red-600 rounded-xl hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider shadow-lg transform hover:-translate-y-0.5 transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={14} />
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
                </div>

                {/* Footer sticky */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    {activeTab === 'general' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-3.5 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => document.getElementById('product-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                                disabled={isSubmitting}
                                className="px-8 py-3.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Guardando...' : (currentProduct ? 'Guardar Cambios' : 'Guardar y Continuar')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-8 py-3.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all"
                        >
                            Finalizar y Cerrar
                        </button>
                    )}
                </div>
            </div>

            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
