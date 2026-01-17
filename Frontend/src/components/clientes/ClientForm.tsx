import { useState, useEffect } from 'react';
import { X, Save, ChevronDown } from 'lucide-react';
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

    // Country code state
    const [countryCode, setCountryCode] = useState('+591');

    // Country codes data
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
        e.preventDefault();
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Juan"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paterno</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.paterno}
                                onChange={e => setFormData({ ...formData, paterno: e.target.value })}
                                placeholder="Ej: Perez"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Materno</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.materno}
                                onChange={e => setFormData({ ...formData, materno: e.target.value })}
                                placeholder="Ej: Gomez"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CI / NIT</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.nit_ci}
                                onChange={e => setFormData({ ...formData, nit_ci: e.target.value })}
                                placeholder="Ej: 1234567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <div className="flex gap-2">
                                <div className="relative w-24 shrink-0">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full appearance-none px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer bg-white text-sm"
                                    >
                                        {countryCodes.map((item) => (
                                            <option key={item.code} value={item.code}>
                                                {item.flag} {item.code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <ChevronDown className="h-3 w-3" />
                                    </div>
                                </div>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="77712345"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="cliente@ejemplo.com"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            <Save size={18} />
                            {loading ? 'Guardando...' : 'Guardar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
