import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VendorDashboard } from '../../screens/v2/vendor/VendorDashboard';
import { POSCatalogScreen } from '../../screens/v2/sales/POSCatalogScreen';
import { POSCartScreen } from '../../screens/v2/sales/POSCartScreen';
import { POSCheckoutScreen } from '../../screens/v2/sales/POSCheckoutScreen';
import { SalesScreen } from '../../screens/v2/owner/SalesScreen';

const Stack = createNativeStackNavigator();

export const VendorStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="VendorDashboard" component={VendorDashboard} />

      {/* POS Module for Vendor */}
      <Stack.Screen name="POSCatalog" component={POSCatalogScreen} />
      <Stack.Screen name="POSCart" component={POSCartScreen} />
      <Stack.Screen name="POSCheckout" component={POSCheckoutScreen} />

      {/* Shared Screens */}
      <Stack.Screen name="Sales" component={SalesScreen} />
    </Stack.Navigator>
  );
};
