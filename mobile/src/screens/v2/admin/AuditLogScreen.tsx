import React from 'react';
import { View, SectionList } from 'react-native';
import { Text, Surface, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Database, UserX } from 'lucide-react-native';

export const AuditLogScreen = () => {
    // Mock Data
    const logs = [
        { title: 'Hoy', data: [
            { id: '1', action: 'DELETE_TENANT', target: 'Bodega Peques', user: 'Admin Principal', time: '10:30 AM', type: 'critical' },
            { id: '2', action: 'UPDATE_PLAN', target: 'Plan Pro', user: 'Admin Principal', time: '09:15 AM', type: 'info' },
        ]},
        { title: 'Ayer', data: [
            { id: '3', action: 'SUSPEND_TENANT', target: 'Librería Central', user: 'Admin Support', time: '16:45 PM', type: 'warning' },
            { id: '4', action: 'CREATE_TENANT', target: 'Nueva Empresa', user: 'System', time: '11:20 AM', type: 'info' },
        ]}
    ];

    const getIcon = (type: string) => {
        switch(type) {
            case 'critical': return <UserX size={20} color="#ef4444" />;
            case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
            default: return <Database size={20} color="#3b82f6" />;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
            <View className="px-4 py-3">
                <Text variant="headlineMedium" className="font-black text-slate-800">Audit Logs</Text>
                <Text variant="bodyMedium" className="text-slate-500">Actividad crítica del sistema</Text>
            </View>

            <SectionList
                sections={logs}
                keyExtractor={(item) => item.id}
                renderSectionHeader={({ section: { title } }) => (
                    <Text className="px-4 py-2 font-bold text-slate-400 uppercase tracking-wider text-xs bg-slate-50">
                        {title}
                    </Text>
                )}
                renderItem={({ item }) => (
                    <View className="px-4 py-3 flex-row items-center border-b border-slate-100 bg-white">
                        <View className={`p-2 rounded-full mr-3 ${item.type === 'critical' ? 'bg-red-50' : item.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                            {getIcon(item.type)}
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-slate-800">{item.action}</Text>
                            <Text className="text-slate-500 text-xs">Target: {item.target}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-xs font-medium text-slate-600">{item.user}</Text>
                            <Text className="text-xs text-slate-400">{item.time}</Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
};
