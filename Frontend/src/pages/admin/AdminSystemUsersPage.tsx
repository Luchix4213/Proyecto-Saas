import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import type { Usuario } from '../../services/userService';
import { Plus, Pencil, Trash2, KeyRound, Ban, ShieldCheck, CheckCircle2, UserCog } from 'lucide-react';
import { UserForm } from '../../components/usuarios/UserForm';
import { ChangePasswordModal } from '../../components/usuarios/ChangePasswordModal';

export const AdminSystemUsersPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
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

    const stats = {
        total: usuarios.length,
        active: usuarios.filter(u => u.estado === 'ACTIVO').length
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="text-teal-600" />
                        Administradores del Sistema
                    </h2>
                    <p className="text-slate-500 mt-1">Gestión de usuarios con acceso global al panel administrativo (SaaS Core).</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all hover:-translate-y-0.5 hover:shadow-teal-500/30"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Nuevo Administrador
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Administradores</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
                        <UserCog size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activos</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
                                            <span className="text-sm font-medium text-slate-500">Cargando administradores...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No hay administradores registrados.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((user) => (
                                    <tr key={user.usuario_id} className={`group hover:bg-slate-50/80 transition-colors ${user.estado === 'INACTIVO' ? 'bg-slate-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${user.estado === 'INACTIVO'
                                                        ? 'bg-slate-100 text-slate-400'
                                                        : 'bg-violet-100 text-violet-700'
                                                    }`}>
                                                    {user.nombre.charAt(0)}{user.paterno?.charAt(0)}
                                                </div>
                                                <div className="font-medium text-slate-900">
                                                    {user.nombre} {user.paterno}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                                {user.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.estado === 'ACTIVO'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${user.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {user.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    title={user.estado === 'ACTIVO' ? 'Dar de Baja' : 'Reactivar'}
                                                    className={`p-2 rounded-lg transition-colors border ${user.estado === 'ACTIVO'
                                                            ? 'text-slate-400 border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50'
                                                            : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    {user.estado === 'ACTIVO' ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleChangePassword(user)}
                                                    title="Cambiar Password"
                                                    className="p-2 text-slate-400 border border-slate-200 rounded-lg hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-colors"
                                                >
                                                    <KeyRound size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    title="Editar"
                                                    className="p-2 text-slate-400 border border-slate-200 rounded-lg hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    title="Eliminar"
                                                    className="p-2 text-slate-400 border border-slate-200 rounded-lg hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modales */}
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
