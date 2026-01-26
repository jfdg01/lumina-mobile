# PRD: ProjectAlign - Digital Projector Assistant

## 1. Introduction/Overview

ProjectAlign is a specialized React Native mobile utility designed for traditional artists (muralists, realist painters) who use digital projectors to transfer sketches onto canvases. The app allows users to import reference images, manipulate them (scale, rotate, translate) to match a physical canvas, and strictly "lock" the projection. 

Key differentiator: ProjectAlign saves exact geometric coordinates and handles local image persistence, ensuring that artists can resume work across multiple sessions with zero re-alignment effort.

## 2. Goals

- **Robust Persistence:** Images are copied to the app sandbox so external deletions don't break projects.
- **Precision Alignment:** High-performance gesture controls for pixel-perfect positioning.
- **Safety Mode:** strict separation between "Edit Mode" (manipulation active) and "Projection Mode" (locked) to prevent accidental shifts.
- **Speed:** Allow artists to be set up and painting in under 30 seconds.

## 3. User Stories

### US-001: Create Project Image Import
**Description:** As an artist, I want to import a reference image so that I can use it for projection, knowing it won't be lost if I clean my gallery.

**Acceptance Criteria:**
- [ ] User can pick an image from the device gallery.
- [ ] App automatically copies the selected image to the app's internal sandbox storage (`DocumentDirectory`).
- [ ] A new Project record is created linking to the sandboxed file.
- [ ] Typecheck/lint passes.

### US-002: Alignment Workspace (Edit Mode)
**Description:** As an artist, I want to scale, rotate, and move the image to match my canvas exactly.

**Acceptance Criteria:**
- [ ] Support simultaneous Pan, Pinch (Scale), and Rotation gestures.
- [ ] UI visual indicator clearly shows "EDIT MODE" (e.g., unlocked padlock icon or yellow border).
- [ ] "Reset" button restores image to default center/scale.
- [ ] Verify in browser/simulator that gestures are smooth (60fps).

### US-003: Projection Mode (Lock)
**Description:** As an artist, I want to lock the screen so that touching the phone doesn't ruin my alignment.

**Acceptance Criteria:**
- [ ] Toggle switch or button to enter "Projection Mode".
- [ ] In Projection Mode: All transformation gestures are disabled.
- [ ] UI overlays (buttons, headers) fade out or minimize to reduce light pollution.
- [ ] Accidental touches do not move the image.
- [ ] Typecheck/lint passes.

### US-004: Persistence & Resume
**Description:** As an artist, I want my exact alignment to be saved so I can resume painting tomorrow without realigning the projector.

**Acceptance Criteria:**
- [ ] App auto-saves `translateX`, `translateY`, `scale`, and `rotation` values.
- [ ] App auto-saves the active state/project ID.
- [ ] Relaunching the app loads the last active project with its exact transform values applied immediately.
- [ ] Verify in simulator: Kill app, restart, image is in exact same spot.

## 4. Functional Requirements

### 4.1 Data Management
- **FR-1:** System must copy imported images to `FileSystem.documentDirectory` using a UUID filename.
- **FR-2:** Data schema must support 1 Project = 1 Image + 1 Transform Set.
- **FR-3:** Storage engine: `AsyncStorage` for metadata, FileSystem for assets.

### 4.2 Editing Capabilities
- **FR-4:** Translation: Infinite canvas panning.
- **FR-5:** Scaling: Min scale 0.01x, Max scale 50x.
- **FR-6:** Rotation: 360-degree rotation support.

### 4.3 Interface States
- **FR-7:** **Edit State:** Full UI visibility, gestures active.
- **FR-8:** **view State:** Minimal/No UI, black background, gestures ignored.

## 5. Non-Goals (Out of Scope)

- **Cloud Sync:** No backup to iCloud/Drive/S3. Local only.
- **Multiple Presets:** Only one "view" saved per image/project.
- **Tablet Optimization:** UI optimized for generic Phone Portrait mode.
- **Keystone Correction:** No complex perspective warping.

## 6. Design Consideration

- **Theme:** Dark mode by default (crucial for projection to avoid light bleeding outside the image area).
- **Contrast:** UI controls should use high contrast but be toggleable/collapsible.

## 7. Technical Considerations

- **Framework:** React Native (Expo recommended for ease of FileSystem access).
- **Animation:** `react-native-reanimated` v3 for shared value transforms.
- **Gestures:** `react-native-gesture-handler` -> `Gesture.Simultaneous(Pan, Pinch, Rotation)`.
- **File System:** `expo-file-system` for copying assets.
- **Permissions:** Gallery read permissions required.

## 8. Success Metrics

- **Setup Time:** Returning user loads saved project and sees correct alignment in < 5 seconds.
- **Stability:** Zero accidental alignment shifts reported during "Projection Mode".

## 9. Open Questions

- Should we prevent the phone from auto-locking/sleeping while in Projection Mode? (Assumed Yes - critical for projectors).
