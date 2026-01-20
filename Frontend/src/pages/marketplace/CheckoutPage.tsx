import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingBag, ArrowLeft, CreditCard, QrCode, User, Mail, CreditCard as IdCard, CheckCircle2, Package } from 'lucide-react';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';

export const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug || slug === 'undefined') {
       navigate('/');
    }
  }, [slug, navigate]);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    nit_ci: '',
    metodo_pago: 'QR',
  });

  const [file, setFile] = useState<File | null>(null);
  const [zoomQr, setZoomQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  const total = getTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!file && formData.metodo_pago !== 'EFECTIVO') { // Assuming Efectivo logic might exist later, but for now enforcing file
      alert('Por favor sube el comprobante de pago');
      return;
    }

    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('nombre', formData.nombre);
      formPayload.append('email', formData.email);
      formPayload.append('nit_ci', formData.nit_ci);
      formPayload.append('metodo_pago', formData.metodo_pago);
      formPayload.append('productos', JSON.stringify(items.map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
      }))));

      if (file) {
        formPayload.append('comprobante', file);
      }

      // Using api instance
      const response = await api.post(`/ventas/public/${slug}/checkout`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setOrderResult(response.data);
      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(`Error al procesar el pedido: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess && orderResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="bg-white max-w-2xl w-full rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

          <div className="h-24 w-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-8 text-teal-600 animate-bounce">
            <CheckCircle2 size={48} />
          </div>

          <h2 className="text-4xl font-black text-slate-900 mb-4">¡Pedido Realizado!</h2>
          <p className="text-slate-500 mb-10 text-lg">Tu pedido ha sido registrado con éxito. El número de orden es <span className="font-bold text-slate-900">#{orderResult.venta_id}</span></p>

          <div className="bg-slate-50 rounded-[2rem] p-8 mb-10 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
              <CheckCircle2 size={20} className="text-teal-600" /> Comprobante Recibido
            </h3>
            <p className="text-slate-500 mb-6">Tu comprobante ha sido enviado a revisión. Te notificaremos cuando tu pedido sea aprobado.</p>

            {formData.metodo_pago === 'QR' && (
              <div className="flex flex-col items-center opacity-50 pointer-events-none grayscale">
                <p className="text-xs mb-2">(Referencia del pago realizado)</p>
                <div className="h-32 w-32 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 p-2">
                  <img
                    src={getImageUrl("/uploads/tenants/QR_generado.jpeg")}
                    alt="QR de Pago"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <Link to={`/tienda/${slug}`} className="inline-flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">

        <div className="mb-12 flex items-center justify-between">
          <Link to={`/tienda/${slug}`} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors font-bold group">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <ArrowLeft size={18} />
            </div>
            Volver al Catálogo
          </Link>
          <div className="h-12 w-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Información de Envío</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Tu Nombre</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                      <input
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                        placeholder="Ej: Juan Perez"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                        placeholder="juan@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">NIT / CI (Opcional)</label>
                  <div className="relative group">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                    <input
                      type="text"
                      name="nit_ci"
                      value={formData.nit_ci}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                      placeholder="Para tu factura..."
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <CreditCard size={20} className="text-teal-500" /> Método de Pago
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'QR' }))}
                      className={`p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.metodo_pago === 'QR'
                        ? 'border-teal-500 bg-teal-50/30 text-teal-700'
                        : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                      <QrCode size={32} />
                      <span className="font-bold">Pago QR</span>
                      {formData.metodo_pago === 'QR' && (
                        <>
                          <div
                            className="mt-4 h-64 w-64 bg-white rounded-2xl overflow-hidden border-2 border-teal-100 p-2 shadow-lg cursor-zoom-in group relative"
                            onClick={() => setZoomQr(true)}
                          >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-bold transition-opacity">Ampliar</span>
                            </div>
                            <img
                              src={getImageUrl("/uploads/tenants/QR_generado.jpeg")}
                              alt="Scan QR"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Zoom Modal */}
                          {zoomQr && (
                            <div
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
                              onClick={() => setZoomQr(false)}
                            >
                              <div className="bg-white p-4 rounded-3xl animate-scale-in max-w-full max-h-full overflow-auto" onClick={e => e.stopPropagation()}>
                                <img
                                  src={getImageUrl("/uploads/tenants/QR_generado.jpeg")}
                                  alt="Scan QR Full"
                                  className="w-[500px] h-[500px] object-contain"
                                />
                                <button
                                  onClick={() => setZoomQr(false)}
                                  className="mt-4 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                  Cerrar
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, metodo_pago: 'TRANSFERENCIA' }))}
                      className={`p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.metodo_pago === 'TRANSFERENCIA'
                        ? 'border-teal-500 bg-teal-50/30 text-teal-700'
                        : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                      <IdCard size={32} />
                      <span className="font-bold">Transferencia</span>
                    </button>
                  </div>
                </div>

                <div className="pt-8">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Comprobante de Pago (Requerido)</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-slate-900 file:text-white
                        hover:file:bg-slate-800
                        cursor-pointer
                      "
                  />
                  <p className="text-xs text-slate-400 mt-2">Sube una captura de tu transferencia o pago QR para procesar el pedido.</p>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>Confirmar Pedido • {total.toFixed(2)}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 text-white sticky top-12">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-white">
                <Package size={24} className="text-teal-400" /> Resumen del Pedido
              </h2>

              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                {items.map(item => (
                  <div key={item.producto_id} className="flex items-center gap-4 group">
                    <div className="h-16 w-16 bg-white/10 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                      {item.imagen_url ? (
                        <img src={getImageUrl(item.imagen_url)} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={24} className="text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate text-sm">{item.nombre}</h4>
                      <p className="text-slate-400 text-xs font-medium">Cant: {item.cantidad}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-teal-400">{(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>Subtotal</span>
                  <span>{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>Envío</span>
                  <span className="text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-md">FREE</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-lg font-bold text-white">Total Final</span>
                  <div className="text-right leading-none">
                    <span className="text-4xl font-black text-white">{total.toFixed(2)}</span>
                    <span className="ml-1 text-xs font-black text-slate-400">BOB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
