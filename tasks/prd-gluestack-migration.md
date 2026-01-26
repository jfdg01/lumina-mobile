# PRD: Gluestack UI Migration & Refresh

## Introduction
Migrate the existing React Native application to use **Gluestack UI** fully. The goal is to replace custom `StyleSheet` implementations and ad-hoc styling with a standardized, design-system-driven approach using Gluestack components and **NativeWind** (Tailwind CSS) for styling. This includes a visual refresh to leverage modern Gluestack aesthetics.

## Goals
-   **Complete Migration**: Replace all core UI elements (View, Text, TouchableOpacity, etc.) with Gluestack equivalents (Box, Text, Button, Pressable).
-   **Styling Strategy**: Use **NativeWind** classes (`className="..."`) for all styling, removing `StyleSheet.create` entirely where possible.
-   **Design Refresh**: Adopt Gluestack's default modern theme (dark mode), retiring the custom `styles/theme.ts`.
-   **Maintainability**: Reduce CSS boilerplate and unify component usage.

## User Stories

### US-001: Global Configuration & Cleanup
**Description:** As a developer, I want the project configured correctly for Gluestack + NativeWind so I can build features without conflict.
**Acceptance Criteria:**
- [ ] Verify `GluestackUIProvider` is correctly wrapping the root.
- [ ] Ensure `global.css` imports Tailwind directives and is loaded.
- [ ] Verify `tailwind.config.js` includes all Gluestack component paths.
- [ ] Remove `src/styles/theme.ts` (or mark as deprecated).
- [ ] Application runs without errors.

### US-002: App Shell & Navigation Layout
**Description:** As a user, I want a modern, cohesive app shell.
**Acceptance Criteria:**
- [ ] Convert `App.tsx` container and layout to use `Box`, `Center`, `VStack` (or `class="flex-col"`).
- [ ] Replace `StatusBar` usage if Gluestack handles it (or keep native but style container).
- [ ] Replace custom header and overlay controls in `App.tsx` with Gluestack components (e.g., `Heading`, `HStack` for top bar).
- [ ] Use NativeWind for positioning (e.g., `absolute top-0 w-full`).
- [ ] Verify in browser.

### US-003: Project List Component Refresh
**Description:** As a user, I want to browse my projects in a visually appealing list.
**Acceptance Criteria:**
- [ ] Rewrite `ProjectList.tsx` using Gluestack `Card` (if available) or styled `Box`.
- [ ] Use `Text` (Gluestack) for all typography with correct semantic sizes (`size="xl"`, etc.).
- [ ] Replace standard buttons with Gluestack `Button` variants (Primary, Outline).
- [ ] Implement responsive layout using NativeWind classes.
- [ ] Verify in browser.

### US-004: Image Importer Screen Refresh
**Description:** As a user, I want a sleek interface for importing new images.
**Acceptance Criteria:**
- [ ] Rewrite `ImageImporter.tsx`.
- [ ] Use Gluestack input fields (if any) or styled Drop zones.
- [ ] Replace "Cancel" and "Import" buttons with Gluestack versions.
- [ ] Ensure loading states use Gluestack `Spinner` or equivalent.
- [ ] Verify in browser.

### US-005: Alignment Workspace Controls
**Description:** As a user, I want ergonomic and good-looking controls when aligning my projection.
**Acceptance Criteria:**
- [ ] Rewrite the overlay controls in `AlignmentWorkspace.tsx`.
- [ ] Replace "Hide Controls", "Undo", "Redo" buttons with icon-supported Gluestack `Button` or `Pressable`.
- [ ] Ensure the main workspace canvas area remains functional (Reanimated/GestureHandler logic preserved).
- [ ] Style the floating menus/panels using Gluestack "Glassmorphism" effect where appropriate (using background opacity/blur if supported, or semi-transparent colors).
- [ ] Verify in browser.

## Functional Requirements
-   **FR-1**: All text must use the `<Text>` component from Gluestack.
-   **FR-2**: All layout containers must use `<Box>`, `<VStack>`, `<HStack>`, or `<Center>` from Gluestack (or standard primitive with Tailwind classes).
-   **FR-3**: No `StyleSheet.create` styles should remain in migrated files; use `className` or inline styles only if dynamic values require it.
-   **FR-4**: Use Gluestack's default color palette (e.g., using Tailwind color tokens like `bg-primary-500` if mapped, or Gluestack's default tokens).

## Non-Goals
-   Changing the core business logic (State management via Zustand stays same).
-   Changing the underlying `react-native-gesture-handler` or `react-native-reanimated` logic for the image manipulation (only the wrapping UI/controls change).

## Technical Considerations
-   **NativeWind**: Ensure `nativewind-env.d.ts` is present.
-   **Icons**: Decide if we use `lucide-react-native` (common with Gluestack) or Expo icons. (Gluestack often has an Icon component).
-   **Performance**: Avoid over-nesting Gluestack providers.

## Success Metrics
-   0 instances of `react-native` imports for View, Text in migrated files (except specifically required primitive props).
-   Visual consistency across all 3 main screens (List, Import, Workspace).
-   Passes visual verification.

## Open Questions
-   Do we need specific "Glass" components? *Assumption: We will approximate with rgba colors and blur view if needed.*
