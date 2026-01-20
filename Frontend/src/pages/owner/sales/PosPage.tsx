import { useState, useEffect } from 'react';
import { productsService, type Product } from '../../../services/productsService';
import { salesService, type CreateVentaData } from '../../../services/salesService';
import { clientsService, type Cliente } from '../../../services/clientsService';
import { POSProductGrid } from '../../../components/sales/POSProductGrid';
import { POSCart, type CartItem } from '../../../components/sales/POSCart';
import { CheckoutModal } from '../../../components/sales/CheckoutModal';

export const PosPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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

    const handleCheckout = async (data: { client: Cliente | null, paymentMethod: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA' }) => {
        try {
            const saleData: CreateVentaData = {
                tipo_venta: 'FISICA',
                metodo_pago: data.paymentMethod,
                cliente_id: data.client?.cliente_id,
                productos: cart.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: item.cartQuantity
                }))
            };

            await salesService.create(saleData);

            // Reset
            setCart([]);
            setIsCheckoutOpen(false);
            await loadData(); // Refresh stock
            alert('Venta realizada con éxito');
        } catch (error: any) {
            console.error('Sale error:', error);
            alert(error.response?.data?.message || 'Error al procesar la venta');
        }
    };

    return (
        <div className="flex bg-slate-100 h-[calc(100vh-6rem)] -m-6 md:-m-8 overflow-hidden relative">

             {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col min-w-0">
                <POSProductGrid
                    products={products}
                    loading={loading} // Add prop to component if not already there, wait, I removed loading prop from component def in my thought but put it in file write? No, I put it in write.
                    onAddToCart={addToCart}
                />
            </div>

            {/* Right: Cart Panel */}
            <div className="h-full shrink-0 z-30 shadow-2xl">
                 <POSCart
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onCheckout={() => setIsCheckoutOpen(true)}
                    onClearCart={() => setCart([])}
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
        </div>
    );
};

