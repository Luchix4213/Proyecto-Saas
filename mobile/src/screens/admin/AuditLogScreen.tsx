import React from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Text, Surface, Avatar, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AlertTriangle,
    Database,
    UserX,
    ShieldAlert,
    CheckCircle2,
    Info,
    Trash2,
    Edit,
    PlusCircle
} from 'lucide-react-native';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { auditService, AuditLog } from '../..//api/auditService';
import { useFocusEffect } from '@react-navigation/native';

export const AuditLogScreen = () => {
    const theme = useTheme();
    const [sections, setSections] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await auditService.getAllLogs();
            const grouped = groupLogsByDate(data);
            setSections(grouped);
        } catch (error) {
            console.error('Error loading logs', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadLogs();
        }, [])
    );

    const groupLogsByDate = (logs: AuditLog[]) => {
        const groups: {[key: string]: AuditLog[]} = {};
        logs.forEach(log => {
            const date = new Date(log.created_at).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });

        return Object.keys(groups).map(date => ({
            title: date.charAt(0).toUpperCase() + date.slice(1),
            data: groups[date]
        }));
    };

    const getIconConfig = (action: string) => {
        const lower = action?.toLowerCase() || '';
        if (lower.includes('error') || lower.includes('failed')) return { icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' };
        if (lower.includes('delete') || lower.includes('remove')) return { icon: Trash2, color: '#ef4444', bg: '#fef2f2' };
        if (lower.includes('create') || lower.includes('add')) return { icon: PlusCircle, color: '#10b981', bg: '#ecfdf5' };
        if (lower.includes('update') || lower.includes('edit')) return { icon: Edit, color: '#3b82f6', bg: '#eff6ff' };
        if (lower.includes('login') || lower.includes('auth')) return { icon: ShieldAlert, color: '#8b5cf6', bg: '#f5f3ff' };

        return { icon: Info, color: '#64748b', bg: '#f8fafc' };
    };

    const renderItem = ({ item, index, section }: any) => {
        const { icon: Icon, color, bg } = getIconConfig(item.action);
        const isLastInSection = index === section.data.length - 1;

        let parsedDetails = null;
        try {
            parsedDetails = item.details ? JSON.parse(item.details) : null;
        } catch (e) {
            parsedDetails = item.details;
        }

        return (
            <View style={styles.itemContainer}>
                {/* Timeline Line */}
                <View style={styles.timeline}>
                     <View style={[styles.timelineIcon, { backgroundColor: bg }]}>
                        <Icon size={16} color={color} />
                     </View>
                     {!isLastInSection && <View style={styles.timelineLine} />}
                </View>

                {/* Content */}
                <Surface style={styles.contentCard} elevation={0}>
                    <View style={styles.cardHeader}>
                         <Text style={styles.actionText}>{item.action}</Text>
                         <Text style={styles.timeText}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                         <Text style={styles.targetText}>
                            <Text style={{ fontWeight: '600', color: '#64748b' }}>Target: </Text>
                            {item.entity}
                            {item.entity_id ? ` #${item.entity_id}` : ''}
                        </Text>

                        {/* Tenant Info if available (Admin view) */}
                        {item.tenant_id && (
                            <Text style={[styles.targetText, { marginTop: 4, fontSize: 11 }]}>
                                <Text style={{ fontWeight: '600', color: '#64748b' }}>Tenant ID: </Text>
                                {item.tenant_id}
                            </Text>
                        )}

                        {/* Parsed Details */}
                        {parsedDetails && typeof parsedDetails === 'object' ? (
                            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                                {Object.entries(parsedDetails).slice(0, 4).map(([key, value]) => (
                                    <Text key={key} style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>
                                        <Text style={{ fontWeight: '700' }}>{key}: </Text>
                                        {String(value)}
                                    </Text>
                                ))}
                            </View>
                        ) : parsedDetails ? (
                             <Text style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{String(parsedDetails)}</Text>
                        ) : null}
                    </View>

                    <View style={styles.userRow}>
                        <Avatar.Text
                            size={20}
                            label={item.user?.nombre?.[0] || 'S'}
                            style={{ backgroundColor: '#e2e8f0' }}
                            labelStyle={{ fontSize: 10, lineHeight: 20, color: '#475569' }}
                        />
                         <Text style={styles.userName}>
                            {item.user?.nombre || `Usuario #${item.user_id}`}
                         </Text>
                    </View>
                </Surface>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Audit Logs" subtitle="Actividad crítica del sistema" />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => item.audit_id ? item.audit_id.toString() : index.toString()}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                        </View>
                    )}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    stickySectionHeadersEnabled={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    sectionHeader: { marginBottom: 16, marginTop: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },

    // Timeline Item
    itemContainer: { flexDirection: 'row', marginBottom: 0 },
    timeline: { alignItems: 'center', marginRight: 16, width: 32 },
    timelineIcon: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },

    // Content Card
    contentCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderColor: '#f1f5f9',
        borderWidth: 1
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    actionText: { fontSize: 15, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 8 },
    timeText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    detailsContainer: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, marginBottom: 12 },
    targetText: { fontSize: 13, color: '#334155' },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    userName: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    detailItem: { fontSize: 11, color: '#475569', marginBottom: 2 }
});
