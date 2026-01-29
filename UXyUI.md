# Guia de Diseño Extraída del Producto Actual

Este documento detalla el sistema de diseño y la experiencia de usuario (UX/UI) del producto actual, extraído directamente de la implementación de la aplicación web.

## 🔍 1. Identidad visual detectada

- **Personalidad**: La aplicación transmite una personalidad **moderna, tecnológica y profesional**. Se siente como una herramienta SaaS (Software as a Service) de última generación.
- **Tono**: Es **formal** en su propósito (gestión de negocios) pero **fresco y dinámico** en su ejecución visual.
- **Enfoque**: Es predominantemente **funcional**, priorizando la claridad de los datos, pero incorpora un alto valor **emocional** a través de gradientes vibrantes y micro-animaciones que suavizan la experiencia de gestión pesada.
- **Marca**: Se posiciona como una plataforma de gestión "premium" e intuitiva, bajo la identidad visual de "Kipu".

## 🎨 2. Sistema de colores actual

La paleta se basa en tonos fríos con acentos cálidos para alertas:

- **Color Primario**: Gradiente de **Teal-600 (#0d9488)** a **Emerald-500 (#10b981)**. Se usa en el encabezado principal, botones de acción positiva y estados activos.
- **Color Secundario**: **Slate-900 (#0f172a)**, utilizado para la barra lateral y botones de acción secundaria (Neutros).
- **Colores de Fondo**:
  - `Slate-900` para navegación lateral.
  - `Slate-50` / `Slate-100` para el fondo general de la aplicación.
  - Blanco puro (`#ffffff`) para contenedores de contenido y tarjetas.
- **Colores de Texto**:
  - `Slate-800` para títulos y énfasis.
  - `Slate-500` / `Slate-400` para descripciones y estados desactivados.
- **Colores para estados**:
  - **Éxito**: Emerald-500 / Teal-500.
  - **Error**: Red-500 / Red-600.
  - **Advertencia**: Amber-400 / Amber-500.
  - **Información**: Indigo-500 / Blue-500.

## 🔤 3. Tipografía usada

- **Tipo de letra**: Fuente **Sans-serif (Inter o similar)** definida globalmente para toda la interfaz.
- **Jerarquía**:
  - **Títulos (H1, H2)**: Pesos `font-bold` o `font-black` con tracking apretado.
  - **Etiquetas**: Texto en mayúsculas, tamaño pequeño (`text-xs`), peso `font-black` y tracking amplio (`tracking-widest`).
  - **Cuerpo**: Pesos medios y regulares para facilitar la lectura.
- **Sensación**: Transmite **limpieza, precisión y modernidad**.

## 🧩 4. Estilo visual de la interfaz

- **Bordes**: Uso extensivo de bordes **muy redondeados** (`rounded-3xl`, `rounded-[2.5rem]`). Nada es totalmente recto o afilado.
- **Sombras**: Elevaciones suaves y difusas (`shadow-xl`, `shadow-2xl`) con tintes cromáticos (ej. sombras con tinte `slate-200`).
- **Íconos**: Línea delgada y moderna (Librería **Lucide-react**).
- **Diseño**: Minimalista "con aire". Se evita la saturación mediante el uso de márgenes generosos y espacios en blanco.
- **Tarjetas (Cards)**: Son el bloque constructivo principal, con bordes definidos por una línea sutil (`border-slate-100`) para separar contenidos.

## 📱 5. Patrones de UX detectados

- **Navegación**: Menú lateral izquierdo colapsable para maximizar el área de trabajo. Encabezado superior persistente con contexto de usuario y notificaciones.
- **Prioridad**: La experiencia prioriza la **visibilidad de métricas** (Stat Cards) antes de entrar en el detalle de las listas.
- **Acciones**: Los botones de acción principal (ej. "Nuevo Producto") suelen estar en la esquina superior derecha o integrados en los encabezados de sección.
- **Repetición**: Patrón constante de "Filtros + Buscador" en la parte superior de cada módulo de gestión.

## 🧱 6. Componentes UI existentes

- **Botones**: Altamente redondeados, con estados de hover que incluyen traslaciones hacia arriba (`-translate-y-0.5`) y cambios de elevación.
- **Inputs**: Bordes redondeados, íconos internos a la izquierda, y anillos de enfoque (`ring`) gruesos pero transparentes.
- **Modales**: Centrados, con fondos oscurecidos y desenfocados (blur), utilizando animaciones de escala.
- **Alertas**: Mensajes tipo "Toast" en las esquinas y diálogos de confirmación estilizados.

## ✨ 7. Microinteracciones visibles

- **Framer Motion**: Se detectan transiciones suaves de entrada (`fade-in-up`), animaciones de diseño (`layout`) al filtrar elementos y efectos de "pop" en modales.
- **Feedback**: Cambios de escala al pasar el mouse sobre tarjetas de estadísticas o productos.
- **Cargas**: Spinners personalizados que mantienen la paleta de colores de la marca.

## ♿ 8. Accesibilidad observable

- **Contraste**: Alto contraste entre texto oscuro y fondos claros.
- **Identificabilidad**: Las acciones importantes no dependen solo del color, sino que se acompañan de íconos descriptivos y etiquetas de texto.
- **Targets**: Botones y áreas de clic generosas, adecuadas para una interacción cómoda.

## 📦 9. Resultado final

Este ecosistema visual define una herramienta de gestión que se aleja de la estética gris corporativa tradicional para abrazar un diseño **aspiracional y centrado en el usuario**, facilitando la adopción tecnológica en entornos de negocio.
