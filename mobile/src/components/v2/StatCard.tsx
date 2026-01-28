import React from 'react';
import { View } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { ArrowUpRight, ArrowDownRight, DollarSign, Package } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  icon?: 'money' | 'stock';
  color?: string;
}

export const StatCard = ({ title, value, trend, trendType = 'neutral', icon, color }: StatCardProps) => {
  const theme = useTheme();
  const cardColor = color || theme.colors.surface;

  return (
    <Surface
      style={{
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'white',
        flex: 1,
        margin: 6,
        elevation: 2,
        justifyContent: 'space-between'
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{
          backgroundColor: icon === 'money' ? '#e0f2fe' : '#dcfce7',
          padding: 8,
          borderRadius: 10
        }}>
          {icon === 'money' && <DollarSign size={20} color="#0284c7" />}
          {icon === 'stock' && <Package size={20} color="#16a34a" />}
        </View>

        {trend && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {trendType === 'up' ? <ArrowUpRight size={16} color="green" /> : <ArrowDownRight size={16} color="red" />}
            <Text style={{ fontSize: 12, color: trendType === 'up' ? 'green' : 'red', fontWeight: 'bold' }}>
              {trend}
            </Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>{title}</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>{value}</Text>
      </View>
    </Surface>
  );
};
