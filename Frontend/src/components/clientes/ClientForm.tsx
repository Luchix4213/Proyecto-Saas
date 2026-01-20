import { useState, useEffect } from 'react';
import { X, Save, ChevronDown, User, Mail, Phone, FileText } from 'lucide-react';
import { clientsService } from '../../services/clientsService';
import type { Cliente } from '../../services/clientsService';

interface ClientFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientToEdit?: Cliente | null;
}

export const ClientForm = ({ isOpen, onClose, onSuccess, clientToEdit }: ClientFormProps) => {
    const [formData, setFormData] = useState({
        nombre: '',
        paterno: '',
        materno: '',
        email: '',
        telefono: '',
        nit_ci: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countryCode, setCountryCode] = useState('+591');

    const countryCodes = [
        { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
        { code: '+54', country: 'Argentina', flag: '🇦🇷' },
        { code: '+51', country: 'Perú', flag: '🇵🇪' },
        { code: '+56', country: 'Chile', flag: '🇨🇱' },
        { code: '+57', country: 'Colombia', flag: '🇨🇴' },
        { code: '+52', country: 'México', flag: '🇲🇽' },
        { code: '+1', country: 'USA', flag: '🇺🇸' },
        { code: '+34', country: 'España', flag: '🇪🇸' },
    ];

    useEffect(() => {
        if (clientToEdit) {
            let phone = clientToEdit.telefono || '';
            let code = '+591';

            const foundCode = countryCodes.find(c => phone.startsWith(c.code));
            if (foundCode) {
                code = foundCode.code;
                phone = phone.substring(code.length).trim();
            }
            setCountryCode(code);

            setFormData({
                nombre: clientToEdit.nombre,
                paterno: clientToEdit.paterno || '',
                materno: clientToEdit.materno || '',
                email: clientToEdit.email || '',
                telefono: phone,
                nit_ci: clientToEdit.nit_ci || ''
            });
        } else {
            setFormData({
                nombre: '',
                paterno: '',
                materno: '',
                email: '',
                telefono: '',
                nit_ci: ''
            });
        }
        setError('');
    }, [clientToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Keep native submit for form validation if used
        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const dataToSend = {
                nombre: formData.nombre.trim(),
                paterno: formData.paterno?.trim() || undefined,
                materno: formData.materno?.trim() || undefined,
                email: formData.email?.trim() || undefined,
                telefono: formData.telefono?.trim() ? `${countryCode} ${formData.telefono.trim()}` : undefined,
                nit_ci: formData.nit_ci?.trim() || undefined,
            };

            if (clientToEdit) {
                await clientsService.update(clientToEdit.cliente_id, dataToSend);
            } else {
                await clientsService.create(dataToSend);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleExternalSubmit = () => {
        document.getElementById('client-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Dynamic Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Premium Modal Container */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-slate-100">

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-teal-500/30">
                            <User size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {clientToEdit ? 'Actualizar información' : 'Registrar nuevo comprador'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl transition-all hover:rotate-90 duration-300 shadow-sm border border-transparent hover:border-slate-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
                    <form id="client-form" onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-2 animate-fade-in border border-red-100">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {/* Section: Personal Info */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                                <User size={14} /> Información Personal
                            </h4>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Juan"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Apellido Paterno</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
                                        value={formData.paterno}
                                        onChange={e => setFormData({ ...formData, paterno: e.target.value })}
                                        placeholder="Ej: Perez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Apellido Materno</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
                                        value={formData.materno}
                                        onChange={e => setFormData({ ...formData, materno: e.target.value })}
                                        placeholder="Ej: Gomez"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact Info */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                                <FileText size={14} /> Datos de Contacto
                            </h4>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">CI / NIT</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
                                        value={formData.nit_ci}
                                        onChange={e => setFormData({ ...formData, nit_ci: e.target.value })}
                                        placeholder="Ej: 1234567"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Teléfono</label>
                                <div className="flex gap-3">
                                    <div className="relative w-32 shrink-0">
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="w-full appearance-none px-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none cursor-pointer bg-slate-50 text-slate-700 font-bold text-sm transition-all"
                                        >
                                            {countryCodes.map((item) => (
                                                <option key={item.code} value={item.code}>
                                                    {item.flag} {item.code}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <ChevronDown className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="relative w-full">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
                                            value={formData.telefono}
                                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                            placeholder="77712345"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="cliente@ejemplo.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sticky Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleExternalSubmit}
                        disabled={loading}
                        className="px-8 py-3.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <Save size={16} />
                                {clientToEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};
