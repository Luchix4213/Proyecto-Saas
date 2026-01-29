import { useState, useEffect } from 'react';
import { productsService, type Product } from '../../../services/productsService';
import { salesService, type CreateVentaData } from '../../../services/salesService';
import { clientsService, type Cliente } from '../../../services/clientsService';
import { POSProductGrid } from '../../../components/sales/POSProductGrid';
import { POSCart, type CartItem } from '../../../components/sales/POSCart';
import { CheckoutModal } from '../../../components/sales/CheckoutModal';
import { PostSaleModal } from '../../../components/sales/PostSaleModal';
import { useToast } from '../../../context/ToastContext';

export const PosPage = () => {
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [lastSale, setLastSale] = useState<any | null>(null);

    // Checkout State
    const [clients, setClients] = useState<Cliente[]>([]);

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
            addToast('No se pudieron cargar los datos del POS', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.producto_id === product.producto_id);

        if (existing) {
            if (existing.cartQuantity >= product.stock_actual) {
                addToast('Stock máximo alcanzado', 'warning');
                return;
            }
            addToast(`+1 ${product.nombre}`, 'info');
            setCart(prev => prev.map(item =>
                item.producto_id === product.producto_id
                    ? { ...item, cartQuantity: item.cartQuantity + 1 }
                    : item
            ));
        } else {
            addToast('Agregado al carrito', 'success');
            setCart(prev => [...prev, { ...product, cartQuantity: 1 }]);
        }
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.producto_id !== productId));
        addToast('Producto eliminado', 'info');
    };

    const updateQuantity = (productId: number, delta: number) => {
        const item = cart.find(i => i.producto_id === productId);
        if (!item) return;

        const newQty = item.cartQuantity + delta;
        if (newQty > item.stock_actual) {
            addToast('Sin stock suficiente', 'warning');
            return;
        }

        if (newQty < 1) return;

        setCart(prev => prev.map(item =>
            item.producto_id === productId
                ? { ...item, cartQuantity: newQty }
                : item
        ));
    };

    const updateDiscount = (productId: number, amount: number) => {
        setCart(prev => prev.map(item =>
            item.producto_id === productId
                ? { ...item, descuento: Math.max(0, amount) }
                : item
        ));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.precio) * item.cartQuantity) - (item.descuento || 0), 0);

    const handleCheckout = async (data: {
        client: Cliente | null,
        paymentMethod: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA',
        montoRecibido?: number,
        nitFacturacion?: string,
        razonSocial?: string
    }) => {
        try {
            const saleData: CreateVentaData = {
                tipo_venta: 'FISICA',
                metodo_pago: data.paymentMethod,
                cliente_id: data.client?.cliente_id,
                // New Commercial Fields
                monto_recibido: data.montoRecibido,

                productos: cart.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: item.cartQuantity,
                    descuento: item.descuento
                }))
            };

            const newSale = await salesService.create(saleData);

            setCart([]);
            setIsCheckoutOpen(false);
            setLastSale(newSale);
            await loadData(); // Refresh stock

            // Enhanced notification with sale details
            addToast(
                `✓ Venta registrada: Bs. ${newSale.total.toFixed(2)} | ${cart.length} producto(s)`,
                'success'
            );

        } catch (error: any) {
            console.error('Sale error:', error);
            addToast(error.response?.data?.message || 'Error al procesar la venta', 'error');
        }
    };

    const handleNewSale = () => {
        setLastSale(null);
        setCart([]);
    };

    return (
        <div className="flex h-[calc(100vh-5rem)] -m-4 md:-m-6 lg:-m-8 overflow-hidden relative bg-slate-50">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
                <POSProductGrid
                    products={products}
                    loading={loading}
                    onAddToCart={addToCart}
                />
            </div>

            {/* Right: Cart Panel */}
            <div className="h-full shrink-0 z-20 shadow-[0_0_50px_-15px_rgba(0,0,0,0.15)] relative">
                <POSCart
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    onUpdateDiscount={updateDiscount}
                    onRemoveItem={removeFromCart}
                    onCheckout={() => setIsCheckoutOpen(true)}
                    onClearCart={() => {
                        setCart([]);
                        addToast('Carrito vaciado', 'info');
                    }}
                />
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                total={cartTotal}
                clients={clients}
                onSubmit={handleCheckout}
            />

            {/* Post Sale Modal */}
            <PostSaleModal
                sale={lastSale}
                onClose={() => setLastSale(null)}
                onNewSale={handleNewSale}
            />
        </div>
    );
};
