# CLAUDE.md - ProjectAlign

## Commands
- Start: `npx expo start`
- Typecheck: `npx tsc --noEmit`

## Code Patterns
- **FileSystem**: Use modern `expo-file-system` API (`Paths`, `File`, `Directory`) instead of legacy constants.
  - `Paths.document` instead of `FileSystem.documentDirectory`
  - `new File(src).copy(dest)` instead of `FileSystem.copyAsync`
- **Reanimated**:
  - Requires `babel.config.js` with `react-native-reanimated/plugin`
  - Ensure `babel-preset-expo` is installed when using custom babel config
  - Wrap root component in `GestureHandlerRootView`
  - Import layout animations (e.g., `FadeIn`, `FadeOut`) explicitly from `react-native-reanimated` when using `entering` or `exiting` props.
- **Layout**:
  - Use `position: 'absolute'` for workspaces/canvases that must remain static while UI overlays toggle. flow-based layouts (flex) can cause unwanted shifts.
  - Avoid toggling `borderWidth` or `padding` for selection states; use transparent colors or overlays to maintain box-model geometry.
- **Storage**:
  - Use `StorageService` for all persistent operations; avoid direct `AsyncStorage` calls in components/stores.
  - Use "Collection" key (map) + "Current ID" key for simple multi-item state.
- **Types**:
  - Centralize core interface definitions in `src/types/` (e.g., `src/types/project.ts`) to avoid circular dependencies between services and stores.
- **Interactions**:
  - Use non-obvious triggers (e.g., Long Press) to reveal administrative/navigation controls in "Safe" or "Projection" modes on native.
  - For Web compatibility, ensure a subtle but visible toggle (e.g., low-opacity "Unlock" button) persists to allow keyboard/mouse users to exit locked states.
  - Implement a way to quickly hide these controls once revealed (e.g., "Hide Controls" button).
- **Aesthetic (Flat Design)**:
  - Use `rounded-none` or negligible rounding for containers and buttons.
  - Prioritize solid backgrounds and sharp borders (`border-b`, `border-outline-100`).
  - Use `font-black`, `uppercase`, and `tracking-widest` for primary headers and buttons.
- **Organization**:
  - Group feature-specific components in subdirectories (e.g., `src/components/projects/`).
  - Use \`index.tsx\` as the main entry point for a component folder to simplify imports.
- **Workspace Modularization**: 
  - Break down complex workspaces into \`GestureHandler.tsx\` (for Reanimated/Gesture logic) and \`WorkspaceControls.tsx\` (for UI overlays).
  - Use an orchestrator component to manage shared state (like \`SharedValue\`) and coordinate between logic and UI.
