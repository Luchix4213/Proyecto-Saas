import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from '../../services/userService';
import { Plus, Pencil, Trash2, KeyRound, Ban, CheckCircle2, User, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserForm } from '../../components/usuarios/UserForm';
import { ChangePasswordModal } from '../../components/usuarios/ChangePasswordModal';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const UsersPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const { user: currentUser } = useAuth(); // Obtener usuario actual
    const isAdminOrOwner = currentUser?.rol === 'ADMIN' || currentUser?.rol === 'PROPIETARIO';

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVO' | 'INACTIVO'>('ALL');

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
            addToast('Error al cargar usuarios', 'error');
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
        const accion = user.estado === 'ACTIVO' ? 'dar de baja' : 'reactivar';

        setConfirmConfig({
            isOpen: true,
            title: `Confirmar ${accion}`,
            message: `¿Estás seguro de ${accion} a ${user.nombre}?`,
            type: user.estado === 'ACTIVO' ? 'warning' : 'info',
            onConfirm: async () => {
                try {
                    await userService.update(user.usuario_id, { estado: nuevoEstado });
                    loadUsers();
                    addToast(`Usuario ${accion === 'reactivar' ? 'reactivado' : 'dado de baja'} correctamente`, 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error al cambiar estado:', error);
                    addToast('No se pudo cambiar el estado', 'error');
                }
            }
        });
    };

    const handleDelete = (user: Usuario) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de eliminar a ${user.nombre}? Esta acción no se puede deshacer.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await userService.delete(user.usuario_id);
                    loadUsers(); // Recargar lista
                    addToast('Usuario eliminado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    addToast('No se pudo eliminar el usuario', 'error');
                }
            }
        });
    };

    const filteredUsers = usuarios.filter(u => {
        const matchesStatus = statusFilter === 'ALL' || u.estado === statusFilter;
        const matchesSearch =
            u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.paterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="animate-fade-in-up">
                {/* Ambient Background Elements */}
                <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Section */}
                <AestheticHeader
                    title="Gestión de Equipo"
                    description="Administra los usuarios y niveles de acceso de tu organización."
                    icon={User}
                    iconColor="from-teal-500 to-emerald-600"
                    action={
                        isAdminOrOwner && (
                            <button
                                onClick={handleCreate}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:-translate-y-0.5"
                            >
                                <Plus size={20} className="stroke-[3]" />
                                Nuevo Integrante
                            </button>
                        )
                    }
                />

                {/* Stats Overview */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-indigo-200 transition-all duration-300">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Usuarios</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{usuarios.length}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <User size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-emerald-200 transition-all duration-300">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activos</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{usuarios.filter(u => u.estado === 'ACTIVO').length}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-red-200 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inactivos</p>
                            <p className="text-3xl font-black text-red-500 mt-1">{usuarios.filter(u => u.estado === 'INACTIVO').length}</p>
                        </div>
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Ban size={24} />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/30">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, apellido o email..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="relative w-full sm:w-60">
                                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm appearance-none cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                >
                                    <option value="ALL">Todos los Estados</option>
                                    <option value="ACTIVO">Solo Activos</option>
                                    <option value="INACTIVO">Solo Inactivos</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold">
                                    <Plus size={14} className="rotate-45" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <motion.div
                                    key="loading-mobile"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-20 text-center"
                                >
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mb-2"></div>
                                    <p className="text-slate-400 font-bold">Cargando...</p>
                                </motion.div>
                            ) : filteredUsers.length === 0 ? (
                                <motion.div
                                    key="empty-mobile"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <EmptyState
                                        icon={User}
                                        title="No hay resultados"
                                        description="Intenta cambiar los filtros o el término de búsqueda."
                                    />
                                </motion.div>
                            ) : (
                                filteredUsers.map(user => (
                                    <motion.div
                                        key={user.usuario_id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 bg-white space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner shadow-black/5 ${user.estado === 'INACTIVO' ? 'bg-slate-100 text-slate-400' : 'bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 border border-teal-100'}`}>
                                                    {user.nombre.charAt(0)}{user.paterno?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 leading-tight">{user.nombre} {user.paterno}</h4>
                                                    <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.rol === 'ADMIN' ? 'bg-violet-50 text-violet-700 border-violet-100' : user.rol === 'PROPIETARIO' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                {user.rol}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                                            <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${user.estado === 'ACTIVO' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                <div className={`h-2 w-2 rounded-full ${user.estado === 'ACTIVO' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                                {user.estado}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleToggleStatus(user)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-red-500 transition-colors shadow-sm">
                                                    {user.estado === 'ACTIVO' ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                                                </button>
                                                <button onClick={() => handleEdit(user)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-teal-600 transition-colors shadow-sm">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(user)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-red-400 hover:text-red-600 transition-colors shadow-sm">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Integrante</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contacto</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nivel</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gestión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <motion.tr
                                            key="loading-desktop"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent shadow-lg"></div>
                                                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Sincronizando equipo...</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <motion.tr
                                            key="empty-desktop"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={5}>
                                                <EmptyState
                                                    icon={User}
                                                    title="No se encontraron integrantes"
                                                    description="No hay miembros del equipo que coincidan con tu búsqueda."
                                                />
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <motion.tr
                                                key={user.usuario_id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`group hover:bg-teal-50/30 transition-all duration-300 ${user.estado === 'INACTIVO' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner shadow-black/5 transition-transform group-hover:scale-110 duration-300 ${user.estado === 'INACTIVO'
                                                                ? 'bg-slate-100 text-slate-400'
                                                                : 'bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 border border-teal-100'
                                                            }`}>
                                                            {user.nombre.charAt(0)}{user.paterno?.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 tracking-tight text-base leading-none mb-1">
                                                                {user.nombre} {user.paterno}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Miembro ID #{user.usuario_id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-600">{user.email}</span>
                                                        <span className="text-[10px] text-slate-400 italic">Corporativo</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${user.rol === 'ADMIN'
                                                            ? 'bg-violet-50 text-violet-700 border-violet-100'
                                                            : user.rol === 'PROPIETARIO'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                                : 'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
                                                        {user.rol}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${user.estado === 'ACTIVO'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-slate-100 text-slate-400 border-slate-200'
                                                        }`}>
                                                        <span className={`h-2 w-2 rounded-full ${user.estado === 'ACTIVO' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                        {user.estado}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                        <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                            <button
                                                                onClick={() => handleToggleStatus(user)}
                                                                title={user.estado === 'ACTIVO' ? 'Dar de Baja' : 'Reactivar'}
                                                                className={`p-2.5 rounded-xl transition-all ${user.estado === 'ACTIVO'
                                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-md'
                                                                        : 'text-emerald-600 bg-white shadow-sm'
                                                                    }`}
                                                            >
                                                                {user.estado === 'ACTIVO' ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleChangePassword(user)}
                                                                title="Cambiar Password"
                                                                className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                            >
                                                                <KeyRound size={18} />
                                                            </button>
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
                                                                className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Insight */}
                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold flex justify-between items-center">
                        <span>Sistema de Control de Accesos v2.0</span>
                        <span>Última revisión del equipo: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Modales - Outside animated wrapper to avoid stacking context traps */}
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
