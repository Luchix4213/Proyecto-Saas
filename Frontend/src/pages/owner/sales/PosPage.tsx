import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, X, CheckCircle, Package } from 'lucide-react';
import { productsService, type Product } from '../../../services/productsService';
import { salesService, type CreateVentaData } from '../../../services/salesService';
import { clientsService, type Cliente } from '../../../services/clientsService';

interface CartItem extends Product {
    cartQuantity: number;
}

export const PosPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Checkout State
    const [clients, setClients] = useState<Cliente[]>([]);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'QR' | 'TRANSFERENCIA'>('EFECTIVO');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, clientsData] = await Promise.all([
                productsService.getAll(),
                clientsService.getAll()
            ]);
            setProducts(productsData.filter(p => p.estado === 'ACTIVO' && p.stock_actual > 0));
            setClients(clientsData.filter(c => c.estado === 'ACTIVO'));
        } catch (error) {
            console.error('Error loading POS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.producto_id === product.producto_id);
            if (existing) {
                if (existing.cartQuantity >= product.stock_actual) return prev; // Stock limit
                return prev.map(item =>
                    item.producto_id === product.producto_id
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.producto_id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.producto_id === productId) {
                const newQty = item.cartQuantity + delta;
                if (newQty > item.stock_actual) return item;
                if (newQty < 1) return item;
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.precio) * item.cartQuantity), 0);

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const saleData: CreateVentaData = {
                tipo_venta: 'FISICA',
                metodo_pago: paymentMethod,
                cliente_id: selectedClient?.cliente_id, // Optional
                productos: cart.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: item.cartQuantity
                }))
            };

            await salesService.create(saleData);

            // Reset
            setCart([]);
            setIsCheckoutOpen(false);
            setSelectedClient(null);
            setPaymentMethod('EFECTIVO');
            await loadData(); // Refresh stock
            alert('Venta realizada con éxito'); // Simple feedback for now
        } catch (error: any) {
            console.error('Sale error:', error);
            alert(error.response?.data?.message || 'Error al procesar la venta');
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-6rem)] -m-6 overflow-hidden">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col p-6 pr-0 overflow-hidden">
                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pr-6 pb-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">Cargando productos...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.producto_id}
                                    onClick={() => addToCart(product)}
                                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-left flex flex-col h-full group"
                                >
                                    <div className=" aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                                         {/* Placeholder for image */}
                                         <Package className="text-slate-300 w-12 h-12" />
                                         <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                             <Plus className="text-teal-600 w-10 h-10" />
                                         </div>
                                    </div>
                                    <h3 className="font-bold text-slate-700 line-clamp-2 mb-1">{product.nombre}</h3>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="font-bold text-teal-600 text-lg">Bs {Number(product.precio).toFixed(2)}</span>
                                        <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md text-slate-500">
                                            Stock: {product.stock_actual}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart Panel */}
            <div className="w-96 bg-white shadow-xl flex flex-col border-l border-slate-100 z-10">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingCart className="text-teal-600" />
                        Carrito Actual
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <ShoppingCart size={48} className="text-slate-200" />
                            <p className="text-center font-medium">El carrito está vacío</p>
                            <p className="text-sm text-center max-w-[200px]">Selecciona productos del panel izquierdo para comenzar una venta.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.producto_id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex items-center gap-3">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{item.nombre}</h4>
                                    <div className="text-xs text-teal-600 font-bold">Bs {Number(item.precio).toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.producto_id, -1)}
                                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-red-500"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">{item.cartQuantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.producto_id, 1)}
                                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-green-500"
                                        disabled={item.cartQuantity >= item.stock_actual}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="text-right min-w-[60px]">
                                    <div className="font-bold text-slate-800 text-sm">
                                        {(Number(item.precio) * item.cartQuantity).toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.producto_id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors mt-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals & Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span>Bs {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-2xl font-bold text-slate-800">
                        <span>Total</span>
                        <span>Bs {cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={() => setIsCheckoutOpen(true)}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 transition-all transform active:scale-95"
                    >
                        Cobrar
                    </button>
                </div>
            </div>

            {/* Checkout Modal */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle className="text-teal-600" />
                                Finalizar Venta
                            </h3>
                            <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Client Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Cliente</label>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2">
                                    <button
                                        onClick={() => setSelectedClient(null)}
                                        className={`p-3 rounded-lg text-left transition-all ${!selectedClient ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-500' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="font-bold text-slate-800">Cliente Casual / Genérico</div>
                                        <div className="text-xs text-slate-500">Venta rápida sin registro</div>
                                    </button>
                                    {clients.map(client => (
                                        <button
                                            key={client.cliente_id}
                                            onClick={() => setSelectedClient(client)}
                                            className={`p-3 rounded-lg text-left transition-all ${selectedClient?.cliente_id === client.cliente_id ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-500' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="font-bold text-slate-800">{client.nombre} {client.paterno}</div>
                                            <div className="text-xs text-slate-500">{client.nit_ci || 'Sin documento'}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Método de Pago</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'EFECTIVO', label: 'Efectivo', icon: <img src="https://cdn-icons-png.flaticon.com/512/2489/2489756.png" className="w-6 h-6" alt="" /> }, // Fallback icon or lucide
                                        { id: 'QR', label: 'QR Simple', icon: <CreditCard className="w-6 h-6" /> },
                                        { id: 'TRANSFERENCIA', label: 'Transferencia', icon: <CreditCard className="w-6 h-6" /> },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id as any)}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                                paymentMethod === method.id
                                                ? 'bg-teal-50 border-teal-500 text-teal-700 ring-1 ring-teal-500'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {/* {method.icon} */}
                                            <span className="font-bold text-sm">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                <span className="font-semibold text-slate-600">Total a cobrar</span>
                                <span className="font-bold text-2xl text-slate-800">Bs {cartTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 disabled:opacity-50 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                            >
                                {processing ? 'Procesando...' : 'Confirmar Venta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
