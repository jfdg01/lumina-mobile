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
- **Layout**:
  - Use `position: 'absolute'` for workspaces/canvases that must remain static while UI overlays toggle. flow-based layouts (flex) can cause unwanted shifts.
  - Avoid toggling `borderWidth` or `padding` for selection states; use transparent colors or overlays to maintain box-model geometry.
- **Storage**:
  - Use "Collection" key (map) + "Current ID" key for simple multi-item state.
- **Interactions**:
  - Use non-obvious triggers (e.g., Long Press) to reveal administrative/navigation controls in "Safe" or "Projection" modes to prevent accidental activation.
  - Implement a way to quickly hide these controls once revealed (e.g., "Hide Controls" button).
