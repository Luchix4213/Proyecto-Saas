# Proyecto Saas - Mobile Application 📱

Esta es la aplicación móvil del **Proyecto Saas**, desarrollada con **Expo** y **React Native**. Permite a los consumidores navegar por el marketplace, ver productos por tienda, realizar pedidos y subir comprobantes de pago.

## 🚀 Tecnologías Principales

- **Expo (SDK 54)**: Framework para desarrollo rápido en React Native.
- **NativeWind (Tailwind CSS)**: Para el estilizado mediante clases utilitarias.
- **React Native Paper**: Sistema de diseño para componentes premium.
- **Zustand**: Gestión de estado global (Carrito, Favoritos).
- **React Navigation**: Navegación fluida entre pantallas (Stacks, Tabs).
- **Axios**: Cliente HTTP para integración con el backend.
- **Lucide Icons**: Set de iconos vectoriales.

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (Versión recomendada: 18 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/expo-go) instalado en tu dispositivo móvil (Android/iOS) para pruebas físicas.
- Un emulador de Android (Android Studio) o simulador de iOS (Xcode - solo macOS) si prefieres pruebas locales.

## 🛠️ Instalación

1. Navega al directorio del proyecto `mobile`:

   ```bash
   cd mobile
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## ⚙️ Configuración

Antes de ejecutar la aplicación, debes configurar la URL de la API para que el dispositivo móvil pueda comunicarse con tu backend local.

1. Abre el archivo: `src/api/client.ts`.
2. Busca la constante `API_URL` (línea 5).
3. Reemplaza la dirección IP actual por la **dirección IP de tu computadora** en la red local.

```typescript
// Ejemplo:
export const API_URL = 'http://TU_DIRECCION_IP:3000';
```

> [!NOTE]
> No uses `localhost` o `127.0.0.1`, ya que el dispositivo móvil (o emulador) no podrá resolverlo hacia tu máquina de desarrollo.

## 🏃 Ejecución

Para iniciar el servidor de desarrollo de Metro Bundler:

```bash
# Iniciar Expo con limpieza de caché (recomendado)
npx expo start --clear

# O usando los scripts de npm
npm start
```

### Opciones de Visualización

Una vez iniciado el servidor, verás un código QR en la terminal.

- **Dispositivo Físico**: Escanea el código QR con la aplicación **Expo Go**.
- **Android**: Presiona `a` en la terminal para abrir el emulador.
- **iOS**: Presiona `i` en la terminal para abrir el simulador.

## 📁 Estructura del Proyecto

- `src/api/`: Servicios y clientes para la comunicación con el backend.
- `src/components/`: Componentes reutilizables (AestheticHeader, etc.).
- `src/screens/`: Pantallas de la aplicación divididas por roles (v2/consumer).
- `src/store/`: Estado global con Zustand (cartStore, favoritesStore).
- `src/utils/`: Utilidades para imágenes, almacenamiento y formatos.

---

© 2026 Taller de Proyectos - Proyecto Saas
