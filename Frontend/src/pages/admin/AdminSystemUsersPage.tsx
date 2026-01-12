import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import type { Usuario } from '../../services/userService';
import { Plus, Pencil, Trash2, KeyRound, Ban, ShieldCheck } from 'lucide-react';
import { UserForm } from '../../components/usuarios/UserForm';
import { ChangePasswordModal } from '../../components/usuarios/ChangePasswordModal';

export const AdminSystemUsersPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    // Solo Super Admin puede ver esto (Rol ADMIN y Tenant Principal usualmente)
    // Por ahora asumimos que si entra aqui es porque tiene permisos.
    // La API filtrará por el tenant del usuario logueado.

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Reutilizamos userService.getAll() que trae usuarios del tenant actual.
            // Si soy Super Admin (Tenant ID 1 o Core), traerá a mis colegas Admins.
            const data = await userService.getAll();
            setUsuarios(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: Usuario) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleChangePassword = (user: Usuario) => {
        setSelectedUser(user);
        setIsPasswordOpen(true);
    };

    const handleToggleStatus = async (user: Usuario) => {
        const nuevoEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const accion = user.estado === 'ACTIVO' ? 'dar de baja' : 'reactivar';

        if (window.confirm(`¿Estás seguro de ${accion} a ${user.nombre}?`)) {
            try {
                await userService.update(user.usuario_id, { estado: nuevoEstado });
                loadUsers();
            } catch (error) {
                console.error('Error al cambiar estado:', error);
                alert('No se pudo cambiar el estado');
            }
        }
    };

    const handleDelete = async (user: Usuario) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${user.nombre}? Esta acción no se puede deshacer.`)) {
            try {
                await userService.delete(user.usuario_id);
                loadUsers();
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('No se pudo eliminar el usuario');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-indigo-600" />
                        Administradores del Sistema
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Gestión de usuarios con acceso global al panel administrativo (SaaS Core).</p>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Administrador
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
                        ) : usuarios.map((user) => (
                            <tr key={user.usuario_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{user.nombre} {user.paterno}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                        {user.rol}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {user.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        title={user.estado === 'ACTIVO' ? 'Dar de Baja' : 'Reactivar'}
                                        className={`p-2 rounded-full transition-colors ${user.estado === 'ACTIVO'
                                                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                                            }`}
                                    >
                                        <Ban size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleChangePassword(user)}
                                        title="Cambiar Password"
                                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                    >
                                        <KeyRound size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        title="Editar"
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user)}
                                        title="Eliminar"
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!loading && usuarios.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay administradores registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modales - Reutilizamos los existentes */}
            <UserForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={loadUsers}
                userToEdit={selectedUser}
            />

            {selectedUser && (
                <ChangePasswordModal
                    isOpen={isPasswordOpen}
                    onClose={() => setIsPasswordOpen(false)}
                    userId={selectedUser.usuario_id}
                />
            )}
        </div>
    );
};
