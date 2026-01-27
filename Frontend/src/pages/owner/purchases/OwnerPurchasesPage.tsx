import { useState, useEffect } from 'react';
import { ShoppingBag, History, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsService, type Product } from '../../../services/productsService';
import { suppliersService, type Proveedor } from '../../../services/suppliersService';
import { purchasesService, type CreateCompraData } from '../../../services/purchasesService';
import { ProductSelector } from '../../../components/purchases/ProductSelector';
import { PurchaseCart, type PurchaseItem } from '../../../components/purchases/PurchaseCart';
import { PurchasesPaymentModal } from '../../../components/purchases/PurchasesPaymentModal';
import { ProductForm } from '../../../components/products/ProductForm';
import { SupplierForm } from '../../../components/suppliers/SupplierForm';
import { AestheticHeader } from '../../../components/common/AestheticHeader';
import { useToast } from '../../../context/ToastContext';
import { categoriesService, type Category } from '../../../services/categoriesService';

export const OwnerPurchasesPage = () => {
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cart, setCart] = useState<PurchaseItem[]>([]);

    const [selectedSupplierId, setSelectedSupplierId] = useState<number | 'OWN' | ''>('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, suppliersData, categoriesData] = await Promise.all([
                productsService.getAll(),
                suppliersService.getAll(),
                categoriesService.getAll()
            ]);
            setProducts(productsData.filter(p => p.estado === 'ACTIVO'));
            setSuppliers(suppliersData.filter(s => s.estado === 'ACTIVO'));
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
            addToast('Error al cargar datos del catálogo', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on selection
    const availableProducts = selectedSupplierId === ''
        ? products
        : selectedSupplierId === 'OWN'
            ? products
            : products.filter(p => p.proveedor_id === Number(selectedSupplierId));

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.producto_id === product.producto_id);
            if (existing) {
                addToast(`${product.nombre} ya está en el carrito`, 'info');
                return prev;
            }
            addToast(`${product.nombre} agregado`, 'success');
            return [...prev, {
                ...product,
                purchaseQuantity: 1,
                purchaseCost: Number(product.precio) * 0.7,
                purchaseLote: '',
                purchaseExpiry: ''
            }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.producto_id !== productId));
    };

    const updateItem = (productId: number, field: 'purchaseQuantity' | 'purchaseCost' | 'purchaseLote' | 'purchaseExpiry', value: number | string) => {
        setCart(prev => prev.map(item => {
            if (item.producto_id === productId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleRegisterPurchase = () => {
        if (selectedSupplierId === '') {
            addToast('Selecciona un proveedor para continuar', 'error');
            return;
        }
        if (cart.length === 0) {
            addToast('El carrito de compras está vacío', 'error');
            return;
        }
        setIsPaymentModalOpen(true);
    };

    const [successCompraId, setSuccessCompraId] = useState<number | null>(null);

    const handleConfirmPayment = async (paymentData: {
        paymentMethod: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
        proof: File | null;
        nroFactura?: string;
        observaciones?: string;
    }) => {
        setProcessing(true);
        try {
            const purchaseData: CreateCompraData = {
                ...(selectedSupplierId !== 'OWN' && { proveedor_id: Number(selectedSupplierId) }),
                metodo_pago: paymentData.paymentMethod,
                nro_factura: paymentData.nroFactura,
                observaciones: paymentData.observaciones,
                productos: cart.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: Number(item.purchaseQuantity),
                    costo_unitario: Number(item.purchaseCost),
                    lote: item.purchaseLote,
                    fecha_vencimiento: item.purchaseExpiry,
                }))
            };

            let response;
            if (paymentData.proof) {
                const formData = new FormData();
                formData.append('data', JSON.stringify(purchaseData));
                formData.append('comprobante', paymentData.proof);
                response = await purchasesService.create(formData);
            } else {
                response = await purchasesService.create(purchaseData);
            }

            setCart([]);
            setIsPaymentModalOpen(false);
            await loadData();

            if (response && response.compra_id) {
                setSuccessCompraId(response.compra_id);
                addToast('Compra registrada exitosamente', 'success');
            } else {
                addToast('Compra registrada y stock actualizado', 'success');
            }

        } catch (error: any) {
            console.error('Purchase error:', error);
            addToast('Error al registrar la compra', 'error');
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

            const supplier = suppliers.find(s => s.proveedor_id === Number(selectedSupplierId));
            const empresa = supplier?.nombre.replace(/\s+/g, '_') || 'Empresa';
            const fecha = new Date().toISOString().split('T')[0];

            link.setAttribute('download', `${empresa}_Compra_${id}_${fecha}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addToast('Documento descargado', 'success');
        } catch (error) {
            console.error('Download error:', error);
            addToast('Error al descargar el PDF', 'error');
        }
    };

    if (successCompraId) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center border border-slate-100 transform animate-scale-in">
                    <div className="h-24 w-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-teal-500/30 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">¡Registro Exitoso!</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed">La compra se ha registrado correctamente y el inventario ha sido actualizado en tiempo real.</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleDownloadPdf(successCompraId)}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95"
                        >
                            <History size={20} /> Descargar PDF
                        </button>
                        <button
                            onClick={() => {
                                setSuccessCompraId(null);
                                setSelectedSupplierId('');
                            }}
                            className="w-full py-4 text-slate-400 font-black hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-[11px]"
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
        <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            {/* Header */}
            <AestheticHeader
                title="Gestión de Compras"
                description="Registra ingresos de mercadería y actualiza automáticamente tu inventario."
                icon={ShoppingBag}
                iconColor="from-indigo-600 to-teal-500"
                action={
                    <Link
                        to="/app/compras/historial"
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all hover:border-indigo-200 active:scale-95"
                    >
                        <History size={18} className="text-indigo-500" />
                        Ver Historial
                    </Link>
                }
            />

            <div className="mt-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left: Product Selector */}
                <div className="xl:col-span-8">
                    <ProductSelector
                        products={availableProducts}
                        loading={loading}
                        onSelect={addToCart}
                        onCreateNew={() => setIsProductModalOpen(true)}
                    />
                </div>

                {/* Right: Cart */}
                <div className="xl:col-span-4">
                    <PurchaseCart
                        cart={cart}
                        suppliers={suppliers}
                        selectedSupplierId={selectedSupplierId as any}
                        onSelectSupplier={(val) => setSelectedSupplierId(val as any)}
                        onUpdateItem={updateItem}
                        onRemoveItem={removeFromCart}
                        onSubmit={handleRegisterPurchase}
                        processing={processing}
                        onCreateNewSupplier={() => setIsSupplierModalOpen(true)}
                    />
                </div>
            </div>

            {/* Payment Modal */}
            <PurchasesPaymentModal
                isOpen={isPaymentModalOpen}
                total={cartTotal}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
            />

            {/* Quick Create Modals */}
            <ProductForm
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSuccess={() => {
                    loadData();
                    setIsProductModalOpen(false);
                    addToast('Producto creado!', 'success');
                }}
                productToEdit={null}
                categories={categories}
            />

            <SupplierForm
                isOpen={isSupplierModalOpen}
                onClose={() => setIsSupplierModalOpen(false)}
                onSubmit={async (data) => {
                    try {
                        await suppliersService.create(data);
                        loadData();
                        setIsSupplierModalOpen(false);
                        addToast('Proveedor registrado!', 'success');
                    } catch (error) {
                        addToast('Error al crear proveedor', 'error');
                    }
                }}
                supplier={null}
                isLoading={false}
            />
        </div>
    );
};
