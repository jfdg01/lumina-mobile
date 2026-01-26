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
