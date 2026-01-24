import { useState, useEffect } from 'react';
import { ShoppingBag, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsService, type Product } from '../../../services/productsService';
import { suppliersService, type Proveedor } from '../../../services/suppliersService';
import { purchasesService, type CreateCompraData } from '../../../services/purchasesService';
import { ProductSelector } from '../../../components/purchases/ProductSelector';
import { PurchaseCart, type PurchaseItem } from '../../../components/purchases/PurchaseCart';



export const OwnerPurchasesPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [cart, setCart] = useState<PurchaseItem[]>([]);

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
            // Default cost estimation (70% of price)
            return [...prev, { ...product, purchaseQuantity: 1, purchaseCost: Number(product.precio) * 0.7 }];
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
            await loadData();
            alert('Compra registrada con éxito. Stock actualizado.');
        } catch (error: any) {
            console.error('Purchase error:', error);
            alert('Error al registrar la compra');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="relative min-h-[80vh] w-full max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="animate-fade-in-up">
                {/* Ambient Background Elements */}
                <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10 mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-teal-500/30">
                            <ShoppingBag size={28} />
                        </div>
                        Gestión de Compras (Stock)
                        <Link
                            to="/owner/purchases/history"
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all hover:scale-105"
                        >
                            <History size={18} className="text-indigo-500" />
                            Ver Historial
                        </Link>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg max-w-2xl">
                        Registra ingresos de mercadería y actualiza automáticamente tu inventario y costos.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    {/* Left: Product Selector (2 cols) */}
                    <div className="xl:col-span-2 h-full">
                         <ProductSelector
                            products={products}
                            loading={loading}
                            onSelect={addToCart}
                         />
                    </div>

                    {/* Right: Cart (1 col) */}
                    <div className="xl:col-span-1">
                        <PurchaseCart
                            cart={cart}
                            suppliers={suppliers}
                            selectedSupplierId={selectedSupplierId}
                            onSelectSupplier={setSelectedSupplierId}
                            onUpdateItem={updateItem}
                            onRemoveItem={removeFromCart}
                            onSubmit={handleRegisterPurchase}
                            processing={processing}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
