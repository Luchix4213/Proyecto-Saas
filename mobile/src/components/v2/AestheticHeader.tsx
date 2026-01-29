import React from 'react';
import { View } from 'react-native';
import { Text, IconButton, useTheme, Avatar, Surface } from 'react-native-paper';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

interface AestheticHeaderProps {
  title?: string;
  subtitle?: string;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const AestheticHeader = ({ title, subtitle, onNotificationsPress, showBack, rightAction }: AestheticHeaderProps) => {
  const { user } = useAuthStore();
  const navigation = useNavigation();

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const handleNotifications = () => {
    if (onNotificationsPress) {
        onNotificationsPress();
    } else {
        Alert.alert('Notificaciones', 'No tienes notificaciones pendientes en este momento.');
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 20,
        backgroundColor: '#0d9488', // Fallback to solid color
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showBack ? (
            <Surface style={{ borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginRight: 12 }} elevation={0}>
                <IconButton
                    icon={() => <ChevronLeft size={24} color="white" />}
                    onPress={() => navigation.goBack()}
                    style={{ margin: 0, height: 42, width: 42 }}
                />
            </Surface>
        ) : (
            <View style={{
                height: 42,
                width: 42,
                borderRadius: 21,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)'
            }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                    {getInitials(user?.nombre_completo || '')}
                </Text>
            </View>
        )}

        <View style={{ marginLeft: showBack ? 0 : 14 }}>
          <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {subtitle || 'Panel de Gestión'}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: 'white', marginTop: 1 }}>
            {title || user?.nombre_completo?.split(' ')[0]}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 4 }}>
        {rightAction ? (
            rightAction
        ) : (
            <Surface style={{ borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }} elevation={0}>
                <IconButton
                icon={() => <Bell size={20} color="white" />}
                onPress={handleNotifications}
                style={{ margin: 0 }}
                />
            </Surface>
        )}
      </View>
    </View>
  );
};
