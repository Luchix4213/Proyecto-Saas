import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VendorDashboard } from '../../screens/v2/vendor/VendorDashboard';

const Stack = createNativeStackNavigator();

export const VendorStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
      {/* Future screens: PointOfSale, Catalog, etc. */}
    </Stack.Navigator>
  );
};
