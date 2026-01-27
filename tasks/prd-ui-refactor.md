# PRD: UI Refactor & Design Simplification

## Introduction
The current codebase has several monolithic files (`AlignmentWorkspace.tsx`, `App.tsx`, `useProjectStore.ts`) that mix UI layout, business logic, gesture handling, and persistence. This PRD outlines a comprehensive refactor to move toward an encapsulated, component-based architecture with a "flat" design aesthetic, powered exclusively by Tailwind CSS (NativeWind).

## Goals
1.  **Modular Architecture**: Break down large components into domain-specific folders (`src/components/workspace`, `src/components/projects`).
2.  **Logic Decoupling**: Separate storage persistence from state management and gesture logic from UI presentation.
3.  **Design Rework**: Transition from "Glassmorphism" to a "Flat Design" aesthetic (clean lines, solid colors, high contrast, minimal shadows).
4.  **Tailwind Purity**: Remove all `StyleSheet.create` and inline `style` props, replacing them with NativeWind utility classes.
5.  **Maintainability**: Reduce the line count of individual files to improve readability and testing.

---

## User Stories

### US-001: Persistence & Business Logic Extraction
**Description:** As a developer, I want to move storage logic out of the store so that the store only manages runtime state.

**Acceptance Criteria:**
- [ ] Create `src/services/StorageService.ts` to handle all `AsyncStorage` operations.
- [ ] Update `useProjectStore.ts` to use `StorageService`.
- [ ] Extract complex transform calculations (undo/redo logic) into a helper utility if necessary.
- [ ] Typecheck passes.

### US-002: Project Feature Refactor (Flat Design)
**Description:** As a user, I want a clean, flat list of my projects and a simple import screen.

**Acceptance Criteria:**
- [ ] Move `ProjectList.tsx` to `src/components/projects/ProjectList/index.tsx`.
- [ ] Extract `ProjectCard` into a separate component.
- [ ] Implement "Flat Design": Remove gradients/glass effects; use solid backgrounds and crisp borders.
- [ ] Migrate `ImageImporter.tsx` to `src/components/projects/ImageImporter.tsx`.
- [ ] Remove all hardcoded styles; use only Tailwind classes.
- [ ] Verify in browser using dev-browser skill.

### US-003: Alignment Workspace Modularization
**Description:** As a developer, I want to separate the complex gesture logic from the UI overlay in the workspace.

**Acceptance Criteria:**
- [ ] Move `AlignmentWorkspace.tsx` to `src/components/workspace/`.
- [ ] Create `src/components/workspace/GestureHandler.tsx` specifically for Reanimated/Gesture logic.
- [ ] Create `src/components/workspace/WorkspaceControls.tsx` for the UI overlays (buttons, menus).
- [ ] Ensure `AlignmentWorkspace` acts as a clean orchestrator.
- [ ] Replace "Glassmorphism" overlays with flat, high-contrast panels.
- [ ] Verify in browser using dev-browser skill.

### US-004: App Shell Simplification
**Description:** As a developer, I want `App.tsx` to focus strictly on routing and high-level state.

**Acceptance Criteria:**
- [ ] Move the Animated Header into `src/components/ui/Header.tsx`.
- [ ] Simplify navigation logic (Current Project vs. List vs. Importer).
- [ ] Ensure any remaining inline styles or `Animated.View` style objects in `App.tsx` are migrated to Tailwind via `className`.
- [ ] Verify in browser using dev-browser skill.

### US-005: Global Style Purge
**Description:** As a developer, I want to ensure no `StyleSheet` or inline styles remain in the project.

**Acceptance Criteria:**
- [ ] Search and remove all instances of `StyleSheet.create`.
- [ ] Replace any remaining inline `style={{ ... }}` with NativeWind classes (using `clsx` or `tailwind-merge` if needed for dynamic values).
- [ ] Verify there are no regressions in layout or responsiveness.
- [ ] Typecheck and Lint pass.

---

## Functional Requirements
- **FR-1**: Components must be stored in `src/components/[domain]/`.
- **FR-2**: All UI styling must use NativeWind `className` strings.
- **FR-3**: Persistence must be abstracted into a service layer.
- **FR-4**: UI must follow a "Flat" design language (solid colors, 1px-2px borders, no blur/transparency effects unless strictly functional).

## Non-Goals
- Adding new features or functional changes to the alignment logic.
- Changing the underlying state management library (Zustand).
- Modifying the Gluestack UI primitives (keep them in `src/components/ui`).

## Technical Considerations
- **NativeWind Compatibility**: Some dynamic styles (like transform values calculated by Reanimated) still require `useAnimatedStyle`. These are allowed but should be minimized and encapsulated in the "Gesture" components.
- **Project Structure**:
  ```
  src/
    components/
      projects/
        ProjectList/
        ImageImporter/
      workspace/
        GestureHandler/
        WorkspaceOverlay/
      ui/ (Gluestack primitives)
    services/
      StorageService.ts
      ImageService.ts
    store/
      useProjectStore.ts
  ```

## Success Metrics
- File size reduction: No component file should exceed 150 lines.
- Stylistic consistency: 0 instances of `StyleSheet.create` in the `src/` directory.
- Visual satisfaction: A cleaner, professional flat UI.

## Open Questions
- Do we want to keep the "dark mode" as the default for the flat design, or move to a high-contrast light/dark toggle?
