import { useState } from 'react';
import { Package, Star, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../services/productsService';
import type { Tenant } from '../../services/tenantsService';

interface StorefrontProductCardProps {
    product: Product;
    tenant: Tenant;
    onAddToCart: (product: Product) => void;
    animationDelay?: number;
}

export const StorefrontProductCard = ({ product, tenant, onAddToCart, animationDelay = 0 }: StorefrontProductCardProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Sort images: Principal first, then others
    const sortedImages = product.imagenes && product.imagenes.length > 0
        ? [...product.imagenes].sort((a, b) => (a.es_principal === b.es_principal ? 0 : a.es_principal ? -1 : 1))
        : [];

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    };

    const currentImage = sortedImages.length > 0 ? sortedImages[currentImageIndex] : null;

    return (
        <div
            className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 group flex flex-col animate-fade-in-up h-full"
            style={{ animationDelay: `${animationDelay}s` }}
        >
            <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden group/image">
                {/* Image or Placeholder */}
                {currentImage ? (
                    <img
                        src={`http://localhost:3000${currentImage.url}`}
                        alt={product.nombre}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform duration-700">
                        <Package size={64} strokeWidth={1} />
                    </div>
                )}

                {/* Carousel Controls */}
                {sortedImages.length > 1 && (
                    <>
                        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover/image:opacity-100 transition-opacity z-20">
                            <button
                                onClick={handlePrevImage}
                                className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-700 hover:bg-white hover:text-teal-600 shadow-sm transition-all transform hover:scale-110"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-700 hover:bg-white hover:text-teal-600 shadow-sm transition-all transform hover:scale-110"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        {/* Dots */}
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                            {sortedImages.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex
                                        ? 'w-4 bg-teal-500'
                                        : 'w-1.5 bg-white/60 backdrop-blur-sm'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Fav Button Overlay */}
                <div className="absolute top-4 right-4 z-30">
                    <button className="h-10 w-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
                        <Star size={18} />
                    </button>
                </div>

                {/* Featured Badge */}
                {product.destacado && (
                    <div className="absolute top-4 left-4 z-30">
                        <span className="bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.1em] shadow-lg shadow-amber-400/30">
                            Destacado
                        </span>
                    </div>
                )}
            </div>

            <div className="p-7 flex-1 flex flex-col">
                <div className="flex-1 mb-6">
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2 block ring-1 ring-teal-100 w-fit px-2 py-0.5 rounded-md">
                        {product.categoria?.nombre || 'General'}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight group-hover:text-teal-600 transition-colors mb-2 line-clamp-2">
                        {product.nombre}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed h-[2.5rem]">
                        {product.descripcion || 'Sin descripción disponible'}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio</span>
                        <span className="text-2xl font-black text-slate-900">
                            {Number(product.precio).toFixed(2)} <span className="text-sm font-bold text-slate-500">{tenant.moneda || 'Bs'}</span>
                        </span>
                    </div>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="relative h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-teal-600 transition-all hover:scale-110 shadow-xl shadow-slate-900/10 active:scale-90 group-hover:rotate-6"
                    >
                        <ShoppingBag size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
