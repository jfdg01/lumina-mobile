# Lumina

**Convierte tu tablet en una caja de luz digital para calcar y referenciar dibujos. 100% local, sin suscripciones.**

![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-green.svg)

---

## El problema

Los artistas, ilustradores y diseñadores necesitan una **caja de luz** para calcar contornos, referenciar composiciones y practicar trazos. Las cajas de luz físicas son caras y las apps equivalentes suelen esconder funciones básicas tras suscripciones. **Lumina convierte cualquier tablet o móvil en una caja de luz profesional**: colocas el papel sobre la pantalla y calcas, sin cuotas ni conexión a internet.

---

## Cómo funciona

```mermaid
flowchart LR
    A[Crear proyecto] --> B[Elegir imagen<br/>de la galería]
    B --> C[Modo Edición<br/>pan · zoom · rotar]
    C --> D[Modo Vista<br/>gestos bloqueados<br/>pantalla siempre activa]
    D -->|long-press 2s| C
```

Decisiones técnicas clave y su porqué:

- **Reanimated + Gesture Handler** — los gestos de arrastrar, hacer zoom y rotar corren en el hilo de UI, así el ajuste de la imagen es fluido y sin lag mientras alineas.
- **Zustand** — estado global mínimo y sin boilerplate para gestionar proyectos y transformaciones de imagen.
- **AsyncStorage** — persistencia local en el dispositivo: tus proyectos siguen ahí al cerrar la app.
- **100% offline** — no hay backend ni cuentas; nada sale de tu dispositivo.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React Native + Expo |
| Estilos | NativeWind (Tailwind CSS) |
| Gestos y animaciones | Reanimated + Gesture Handler |
| Estado | Zustand |
| Persistencia | AsyncStorage |

---

## Uso

Lumina tiene dos modos:

- **Modo Edición** — alinea la imagen: arrastra con un dedo para moverla, pellizca para hacer zoom y gira con dos dedos. Pulsa *Reset* para centrarla de nuevo y *Done* para guardar.
- **Modo Vista** — pensado para calcar: la interfaz desaparece, los gestos se bloquean (nada se mueve sin querer) y la pantalla permanece siempre activa.

Para abrir el menú desde el Modo Vista, mantén pulsada la pantalla **2 segundos** (long-press): aparecerán los controles para volver, editar u ocultarlos.

---

## Ejecutar en local

```bash
npm install     # instala dependencias

npm start       # inicia el servidor de Expo
npm run android # abre en Android
npm run ios     # abre en iOS
npm run web     # abre en navegador
```

---

Código abierto (MIT) · 100% local · sin suscripciones.
