import React from 'react';
import { View, Image } from 'react-native';
import { Text, IconButton, useTheme, Avatar, Surface } from 'react-native-paper';
import { Bell, Menu, ChevronLeft } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

interface AestheticHeaderProps {
  title?: string;
  subtitle?: string;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
  showBack?: boolean;
}

export const AestheticHeader = ({ title, subtitle, onNotificationsPress, onMenuPress, showBack }: AestheticHeaderProps) => {
  const theme = useTheme();
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
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: '#f8fafc'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showBack ? (
            <Surface style={{ borderRadius: 50, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', marginRight: 12 }} elevation={0}>
                <IconButton
                    icon={() => <ChevronLeft size={24} color="#0f172a" />}
                    onPress={() => navigation.goBack()}
                    style={{ margin: 0, height: 42, width: 42 }}
                />
            </Surface>
        ) : (
            <Avatar.Text
            size={42}
            label={getInitials(user?.nombre_completo || '')}
            style={{ backgroundColor: '#0f172a' }}
            labelStyle={{ color: 'white', fontWeight: '800', fontSize: 16 }}
            />
        )}

        <View style={{ marginLeft: showBack ? 0 : 14 }}>
          <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {subtitle || 'Panel de Gestión'}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 1 }}>
            {title || user?.nombre_completo?.split(' ')[0]}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Surface style={{ borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9' }} elevation={0}>
            <IconButton
              icon={() => <Bell size={20} color="#64748b" />}
              onPress={handleNotifications}
              style={{ margin: 0 }}
            />
        </Surface>
      </View>
    </View>
  );
};
