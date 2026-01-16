import { useState, useEffect } from 'react';
import { Search, Plus, ShoppingBag, Truck, X, Package } from 'lucide-react';
import { productsService, type Product } from '../../../services/productsService';
import { suppliersService, type Proveedor } from '../../../services/suppliersService';
import { purchasesService, type CreateCompraData } from '../../../services/purchasesService';

interface PurchaseItem extends Product {
    purchaseQuantity: number;
    purchaseCost: number;
}

export const OwnerPurchasesPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [cart, setCart] = useState<PurchaseItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, suppliersData] = await Promise.all([
                productsService.getAll(),
                suppliersService.getAll()
            ]);
            setProducts(productsData.filter(p => p.estado === 'ACTIVO'));
            setSuppliers(suppliersData.filter(s => s.estado === 'ACTIVO'));
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.producto_id === product.producto_id);
            if (existing) return prev;
            return [...prev, { ...product, purchaseQuantity: 1, purchaseCost: Number(product.precio) * 0.7 }]; // Default cost estimtion
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.producto_id !== productId));
    };

    const updateItem = (productId: number, field: 'purchaseQuantity' | 'purchaseCost', value: number) => {
        setCart(prev => prev.map(item => {
            if (item.producto_id === productId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.purchaseCost * item.purchaseQuantity), 0);

    const handleRegisterPurchase = async () => {
        if (!selectedSupplierId) {
            alert('Selecciona un proveedor');
            return;
        }
        if (cart.length === 0) {
            alert('Agrega productos a la compra');
            return;
        }

        setProcessing(true);
        try {
            const purchaseData: CreateCompraData = {
                proveedor_id: Number(selectedSupplierId),
                productos: cart.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: Number(item.purchaseQuantity),
                    costo_unitario: Number(item.purchaseCost)
                }))
            };

            await purchasesService.create(purchaseData);

            // Reset
            setCart([]);
            setSelectedSupplierId('');
            await loadData(); // Refresh stock visualization if we showed it
            alert('Compra registrada con éxito. Stock actualizado.');
        } catch (error: any) {
            console.error('Purchase error:', error);
            alert('Error al registrar la compra');
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <ShoppingBag className="text-teal-600" />
                        Registrar Compra (Ingreso)
                    </h1>
                    <p className="text-slate-500">Reabastece tu inventario registrando compras a proveedores.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Product Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar productos para agregar..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {loading && <p className="text-center text-slate-400 py-4 col-span-2">Cargando catálogo...</p>}
                            {!loading && filteredProducts.map(product => (
                                <button
                                    key={product.producto_id}
                                    onClick={() => addToCart(product)}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                        <Package size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{product.nombre}</h4>
                                        <p className="text-xs text-slate-500">Stock Actual: {product.stock_actual}</p>
                                    </div>
                                    <Plus className="text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Purchase Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Truck className="text-slate-400" size={20} />
                        Detalle de Compra
                    </h3>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Proveedor</label>
                        <select
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                            value={selectedSupplierId}
                            onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                        >
                            <option value="">Selecciona un proveedor...</option>
                            {suppliers.map(s => (
                                <option key={s.proveedor_id} value={s.proveedor_id}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                        {cart.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-4">Selecciona productos para comenzar.</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.producto_id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm text-slate-700 w-3/4 truncate">{item.nombre}</span>
                                        <button onClick={() => removeFromCart(item.producto_id)} className="text-slate-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 block mb-1">Cant.</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full p-1.5 text-sm border border-slate-200 rounded-lg"
                                                value={item.purchaseQuantity}
                                                onChange={(e) => updateItem(item.producto_id, 'purchaseQuantity', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 block mb-1">Costo Unit.</label>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                className="w-full p-1.5 text-sm border border-slate-200 rounded-lg"
                                                value={item.purchaseCost}
                                                onChange={(e) => updateItem(item.producto_id, 'purchaseCost', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right mt-2 text-xs font-bold text-slate-600">
                                        Subtotal: Bs {(item.purchaseQuantity * item.purchaseCost).toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-auto">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-slate-600">Total Compra</span>
                            <span className="font-bold text-xl text-slate-800">Bs {cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleRegisterPurchase}
                            disabled={processing}
                            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? 'Procesando...' : 'Registrar Ingreso'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
