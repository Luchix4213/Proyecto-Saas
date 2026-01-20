import React, { useState } from 'react';
import { Search, Package, Plus, Filter } from 'lucide-react';
import { type Product } from '../../services/productsService';

interface ProductSelectorProps {
    products: Product[];
    loading: boolean;
    onSelect: (product: Product) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ products, loading, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col h-full min-h-[600px]">
            {/* Header / Search */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Catálogo de Productos</h3>
                        <p className="text-sm font-medium text-slate-400">Selecciona items para reabastecer</p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
                        <Package size={24} />
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                        <span className="text-xs font-black uppercase tracking-widest">Cargando inventario...</span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Filter size={48} strokeWidth={1.5} className="opacity-20" />
                        <p className="text-sm font-bold">No se encontraron productos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.producto_id}
                                onClick={() => onSelect(product)}
                                className="group relative bg-white border border-slate-100 rounded-3xl p-4 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20 transition-all text-left flex items-start gap-4 overflow-hidden"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
                                    <Package size={28} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0 z-10">
                                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1 block">
                                        ID: #{product.producto_id}
                                    </span>
                                    <h4 className="font-bold text-slate-800 leading-tight mb-1 truncate">{product.nombre}</h4>
                                    <p className="text-xs font-medium text-slate-400">
                                        Stock actual: <span className="text-slate-600 font-bold">{product.stock_actual}</span>
                                    </p>
                                </div>
                                <div className="absolute right-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <div className="bg-teal-500 text-white p-2 rounded-xl shadow-lg shadow-teal-500/30">
                                        <Plus size={16} strokeWidth={3} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
