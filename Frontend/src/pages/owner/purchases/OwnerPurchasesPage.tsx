import { useState, useEffect } from 'react';
import { ShoppingBag, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsService, type Product } from '../../../services/productsService';
import { suppliersService, type Proveedor } from '../../../services/suppliersService';
import { purchasesService, type CreateCompraData } from '../../../services/purchasesService';
import { ProductSelector } from '../../../components/purchases/ProductSelector';
import { PurchaseCart, type PurchaseItem } from '../../../components/purchases/PurchaseCart';
import { PurchasesPaymentModal } from '../../../components/purchases/PurchasesPaymentModal';


export const OwnerPurchasesPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [cart, setCart] = useState<PurchaseItem[]>([]);

    const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

    // Updated handleRegisterPurchase - Just opens modal
    const handleRegisterPurchase = () => {
        if (!selectedSupplierId) {
            alert('Selecciona un proveedor');
            return;
        }
        if (cart.length === 0) {
            alert('Agrega productos a la compra');
            return;
        }
        setIsPaymentModalOpen(true);
    };

    const [successCompraId, setSuccessCompraId] = useState<number | null>(null);

    const handleConfirmPayment = async (paymentData: { paymentMethod: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA'; proof: File | null }) => {
        setProcessing(true);
        try {
            const purchaseData: CreateCompraData = {
                proveedor_id: Number(selectedSupplierId),
                metodo_pago: paymentData.paymentMethod,
                productos: cart.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: Number(item.purchaseQuantity),
                    costo_unitario: Number(item.purchaseCost)
                }))
            };

            const response = await purchasesService.create(purchaseData);

            // Reset and show success
            setCart([]);
            setSelectedSupplierId('');
            setIsPaymentModalOpen(false);
            await loadData();

            // Show Success UI or Alert with PDF Link
            if (response && response.compra_id) {
                setSuccessCompraId(response.compra_id);
            } else {
                alert('Compra registrada con éxito. Stock actualizado.');
            }

        } catch (error: any) {
            console.error('Purchase error:', error);
            alert('Error al registrar la compra');
        } finally {
            setProcessing(false);
        }
    };
    const handleDownloadPdf = async (id: number) => {
        try {
            const blob = await purchasesService.downloadPdf(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `compra-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Error al descargar el PDF');
        }
    };

    // --- Render Success Modal or Message ---
    if (successCompraId) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full text-center border border-slate-100">
                    <div className="h-20 w-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600 animate-bounce">
                        <ShoppingBag size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">¡Compra Exitosa!</h2>
                    <p className="text-slate-500 mb-8">El stock ha sido actualizado correctamente y se ha notificado al equipo.</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleDownloadPdf(successCompraId)}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            <History size={20} /> Descargar Comprobante PDF
                        </button>
                        <button
                            onClick={() => setSuccessCompraId(null)}
                            className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                        >
                            Cerrar y Continuar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.purchaseQuantity * item.purchaseCost), 0);

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

            {/* Payment Modal */}
            <PurchasesPaymentModal
                isOpen={isPaymentModalOpen}
                total={cartTotal}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
            />
        </div>
    );
};
