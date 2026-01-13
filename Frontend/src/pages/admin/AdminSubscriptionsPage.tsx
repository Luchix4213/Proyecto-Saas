import { useEffect, useState } from 'react';
import { getAllSubscriptions, type Suscripcion } from '../../services/suscripcionesService';

export const AdminSubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            const data = await getAllSubscriptions();
            setSubscriptions(data);
        } catch (err) {
            setError('Error al cargar suscripciones');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestión de Suscripciones (Global)</h1>
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Empresa
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Plan
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Fecha Fin
                            </th>
                             <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Monto
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((sub) => (
                            <tr key={sub.suscripcion_id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {sub.suscripcion_id}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {sub.tenant?.nombre_empresa}
                                    <br/>
                                    <span className="text-gray-500 text-xs">{sub.tenant?.email}</span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {sub.plan?.nombre_plan}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span
                                        className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                                            sub.estado === 'ACTIVA'
                                                ? 'text-green-900'
                                                : 'text-red-900'
                                        }`}
                                    >
                                        <span
                                            aria-hidden
                                            className={`absolute inset-0 opacity-50 rounded-full ${
                                                sub.estado === 'ACTIVA'
                                                    ? 'bg-green-200'
                                                    : 'bg-red-200'
                                            }`}
                                        ></span>
                                        <span className="relative">{sub.estado}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString() : '-'}
                                </td>
                                 <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {sub.monto}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
