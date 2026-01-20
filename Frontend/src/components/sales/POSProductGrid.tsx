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
        <div className="flex flex-col h-full bg-slate-50/50 -m-6 p-6 overflow-hidden">
            {/* Search & Filters */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-14 pr-4 py-4 bg-white border-0 rounded-2xl shadow-sm text-lg font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    <button
                        onClick={() => setActiveFilter('ALL')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveFilter('LOW_STOCK')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'LOW_STOCK' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                    >
                        Stock Bajo
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Package size={64} strokeWidth={1} />
                        <p className="font-bold text-lg">No se encontraron productos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                        {filteredProducts.map(product => {
                            const imageUrl = getProductImage(product);
                            return (
                                <button
                                    key={product.producto_id}
                                    onClick={() => onAddToCart(product)}
                                    className="group relative bg-white p-4 rounded-3xl border border-transparent shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all text-left flex flex-col overflow-hidden"
                                >
                                    <div className="aspect-[4/3] bg-slate-50 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-teal-50 transition-colors">
                                        {imageUrl ? (
                                            <img
                                                src={getImageUrl(imageUrl)}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <Package size={32} className="text-slate-300 group-hover:text-teal-400 transition-colors" />
                                        )}

                                        <div className="absolute inset-0 flex items-center justify-center bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus size={32} className="text-teal-600 scale-50 group-hover:scale-100 transition-transform" strokeWidth={3} />
                                        </div>
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-slate-500 shadow-sm">
                                            Stock: {product.stock_actual}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-slate-700 text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em]">
                                        {product.nombre}
                                    </h3>

                                    <div className="mt-auto flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio</span>
                                            <span className="text-lg font-black text-slate-800">Bs {Number(product.precio).toFixed(2)}</span>
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
