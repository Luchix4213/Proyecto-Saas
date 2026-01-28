import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Surface, Button, Switch, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Edit2 } from 'lucide-react-native';

export const PlansScreen = () => {
    // Mock Data
    const plans = [
        { id: 1, name: 'Starter', price: 0, users: 1, products: 100, active: true },
        { id: 2, name: 'Pro', price: 29.99, users: 10, products: 500, active: true },
        { id: 3, name: 'Enterprise', price: 99.99, users: 999, products: 9999, active: true },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
             <View className="px-4 py-3 flex-row justify-between items-center">
                <Text variant="headlineMedium" className="font-black text-slate-800">Planes SaaS</Text>
                <Button mode="contained-tonal" icon="plus">Nuevo</Button>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {plans.map((plan) => (
                    <Surface key={plan.id} elevation={2} className="bg-white rounded-2xl mb-4 overflow-hidden">
                        <View className={`h-2 w-full ${plan.name === 'Pro' ? 'bg-primary' : 'bg-slate-200'}`} />
                        <View className="p-5">
                            <View className="flex-row justify-between items-start mb-2">
                                <Text variant="titleLarge" className="font-bold text-slate-800">{plan.name}</Text>
                                <Switch value={plan.active} onValueChange={() => {}} color="#6366f1" />
                            </View>
                            <Text variant="displaySmall" className="font-black text-slate-900 mb-4">
                                ${plan.price}<Text variant="titleMedium" className="text-slate-400 font-normal">/mes</Text>
                            </Text>

                            <View className="bg-slate-50 p-3 rounded-lg flex-row justify-between mb-2">
                                <Text className="text-slate-600 font-medium">Límite Usuarios</Text>
                                <Text className="font-bold text-slate-800">{plan.users}</Text>
                            </View>
                            <View className="bg-slate-50 p-3 rounded-lg flex-row justify-between mb-4">
                                <Text className="text-slate-600 font-medium">Límite Productos</Text>
                                <Text className="font-bold text-slate-800">{plan.products}</Text>
                            </View>

                            <Button mode="outlined" icon={() => <Edit2 size={16} color="#6366f1"/>} onPress={() => {}}>
                                Editar Límites
                            </Button>
                        </View>
                    </Surface>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};
