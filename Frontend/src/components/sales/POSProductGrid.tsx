import React, { useState } from 'react';
import { Search, Package, Plus } from 'lucide-react';
import { type Product } from '../../services/productsService';
import { getImageUrl } from '../../utils/imageUtils';

interface POSProductGridProps {
    products: Product[];
    loading: boolean;
    onAddToCart: (product: Product) => void;
}

export const POSProductGrid: React.FC<POSProductGridProps> = ({ products, loading, onAddToCart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL'|'LOW_STOCK'>('ALL');

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' || (activeFilter === 'LOW_STOCK' && p.stock_actual < 5);
        return matchesSearch && matchesFilter;
    });

    const getProductImage = (product: Product) => {
        if (!product.imagenes || product.imagenes.length === 0) return null;
        const principal = product.imagenes.find(img => img.es_principal);
        return principal ? principal.url : product.imagenes[0].url;
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 p-8 overflow-hidden">
            {/* Search & Filters */}
            <div className="flex flex-col xl:flex-row gap-6 mb-8 items-start xl:items-center justify-between shrink-0">
                <div className="relative group w-full xl:w-96">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 custom-scrollbar w-full xl:w-auto">
                    <button
                        onClick={() => setActiveFilter('ALL')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveFilter('LOW_STOCK')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'LOW_STOCK' ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
                    >
                        Stock Bajo
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 text-slate-300">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        </div>
                        <p className="font-bold text-slate-400 animate-pulse tracking-wide">Cargando inventario...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-6">
                        <div className="p-8 bg-white rounded-full shadow-sm">
                            <Package size={64} strokeWidth={1} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-xl text-slate-700">No se encontraron productos</p>
                            <p className="text-slate-400">Intenta con otros términos de búsqueda</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-24">
                        {filteredProducts.map(product => {
                            const imageUrl = getProductImage(product);
                            return (
                                <button
                                    key={product.producto_id}
                                    onClick={() => onAddToCart(product)}
                                    className="group relative bg-white p-3 rounded-[2rem] border border-slate-100 hover:border-indigo-500/30 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col h-full ring-1 ring-slate-900/5 hover:ring-indigo-500/20"
                                >
                                    <div className="aspect-square bg-slate-50 rounded-[1.5rem] mb-4 relative overflow-hidden group-hover:bg-indigo-50/30 transition-colors">
                                        {imageUrl ? (
                                            <img
                                                src={getImageUrl(imageUrl)}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full">
                                                <Package size={40} className="text-slate-200 group-hover:text-indigo-300 transition-colors" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white p-3 rounded-full shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                                <Plus size={24} className="text-indigo-600" strokeWidth={3} />
                                            </div>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-slate-500 shadow-sm border border-slate-100/50">
                                            {product.stock_actual}
                                        </div>
                                    </div>

                                    <div className="px-1 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-700 text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5em] group-hover:text-indigo-700 transition-colors">
                                            {product.nombre}
                                        </h3>

                                        <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Precio</span>
                                                <span className="text-lg font-black text-slate-900 tracking-tight">
                                                    <span className="text-xs text-slate-400 font-bold mr-0.5 align-top mt-1 inline-block">Bs</span>
                                                    {Number(product.precio).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
