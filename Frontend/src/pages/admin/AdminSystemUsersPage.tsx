import { useEffect, useState } from 'react';
import { userService, type Usuario } from '../../services/userService';
import { Plus, Pencil, Trash2, Shield, User as UserIcon, Search, KeyRound, Ban, Users, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { UserForm } from '../../components/usuarios/UserForm';
import { ChangePasswordModal } from '../../components/usuarios/ChangePasswordModal';


export const AdminSystemUsersPage = () => {
    const { addToast } = useToast();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: DialogType;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
    });

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
            addToast('Error al cargar administradores', 'error');
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

    const handleToggleStatus = (user: Usuario) => {
        const nuevoEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const accion = user.estado === 'ACTIVO' ? 'desactivar' : 'reactivar';

        setConfirmConfig({
            isOpen: true,
            title: user.estado === 'ACTIVO' ? 'Desactivar Administrador' : 'Reactivar Administrador',
            message: `¿Estás seguro de ${accion} a ${user.nombre}?`,
            type: user.estado === 'ACTIVO' ? 'danger' : 'info',
            onConfirm: async () => {
                try {
                    await userService.update(user.usuario_id, { estado: nuevoEstado });
                    loadUsers();
                    addToast(`Usuario ${nuevoEstado === 'ACTIVO' ? 'reactivado' : 'desactivado'} correctamente`, 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error al cambiar estado:', error);
                    addToast('Error al cambiar estado del usuario', 'error');
                }
            }
        });
    };

    const handleDelete = (user: Usuario) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Eliminar Administrador',
            message: `¿Estás seguro de eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await userService.delete(user.usuario_id);
                    loadUsers();
                    addToast('Usuario eliminado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    addToast('Error al eliminar el usuario', 'error');
                }
            }
        });
    };

    const filteredUsers = usuarios.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: usuarios.length,
        active: usuarios.filter(u => u.estado === 'ACTIVO').length
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <AestheticHeader
                title="Usuarios del Sistema"
                description="Administra los accesos y roles de los administradores globales de la plataforma."
                icon={Users}
                iconColor="from-blue-500 to-indigo-600"
                action={
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-transparent rounded-[1.25rem] shadow-xl text-sm font-black text-white hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} strokeWidth={3} />
                        NUEVO ADMINISTRADOR
                    </button>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Administradores</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Users size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Usuarios Activos</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <UserIcon size={20} />
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="No hay administradores"
                            description={searchTerm ? "No se encontraron usuarios para tu búsqueda." : "Comienza registrando al primer administrador del sistema."}
                        />
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.usuario_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{user.nombre} {user.paterno}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                                                <Shield size={14} />
                                                {user.rol}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={user.estado}
                                                variant={user.estado === 'ACTIVO' ? 'success' : 'neutral'}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                    <button
                                                        onClick={() => handleChangePassword(user)}
                                                        title="Cambiar Contraseña"
                                                        className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                    >
                                                        <KeyRound size={18} />
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        title={user.estado === 'ACTIVO' ? 'Desactivar' : 'Reactivar'}
                                                        className={`p-2.5 transition-all rounded-xl hover:bg-white hover:shadow-md ${user.estado === 'ACTIVO'
                                                            ? 'text-slate-400 hover:text-red-500'
                                                            : 'text-slate-400 hover:text-emerald-500'}`}
                                                    >
                                                        {user.estado === 'ACTIVO' ? <Ban size={18} /> : <Check size={18} />}
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        title="Editar"
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        title="Eliminar Permanente"
                                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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

            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
