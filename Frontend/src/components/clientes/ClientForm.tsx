import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
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

    useEffect(() => {
        if (clientToEdit) {
            setFormData({
                nombre: clientToEdit.nombre,
                paterno: clientToEdit.paterno || '',
                materno: clientToEdit.materno || '',
                email: clientToEdit.email || '',
                telefono: clientToEdit.telefono || '',
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
                telefono: formData.telefono?.trim() || undefined,
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
                            <input
                                type="tel"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                placeholder="Ej: 77712345"
                            />
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
