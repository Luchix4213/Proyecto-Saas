import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_DATA_KEY = 'kipu_client_data';

export interface ClientData {
    nombre_completo: string;
    nit_ci: string;
    celular?: string;
    direccion?: string;
    referencia?: string;
}

export const storageUtils = {
    saveClientData: async (data: ClientData) => {
        try {
            await AsyncStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving client data', error);
        }
    },

    getClientData: async (): Promise<ClientData | null> => {
        try {
            const data = await AsyncStorage.getItem(CLIENT_DATA_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting client data', error);
            return null;
        }
    },

    clearClientData: async () => {
        try {
            await AsyncStorage.removeItem(CLIENT_DATA_KEY);
        } catch (error) {
            console.error('Error clearing client data', error);
        }
    },

    clearAuth: async () => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing auth', error);
        }
    }
};
