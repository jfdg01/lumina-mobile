# Project Align PRD

## Product Requirements Document

### 1. Product Overview

**ProjectAlign** is a mobile utility designed for traditional artists using digital projectors. It allows users to manipulate a reference image (Scale, Rotate, Translate) and save those exact geometric coordinates as a "Preset." This ensures that even if the phone is disconnected or the app is closed, the artist can return to the exact same projection alignment.

---

### 2. User Personas

* **The Muralist/Studio Artist:** Needs to project a sketch onto a canvas over multiple sessions.
* **The Realist Painter:** Needs high precision to ensure proportions remain consistent when returning to a work in progress.

---

### 3. Functional Requirements

#### 3.1 Image Handling

* **Image Import:** Ability to select an image from the local device gallery (using `react-native-image-picker`).
* **Persistence:** Store the image URI and its transformation metadata locally.

#### 3.2 Manipulation Engine (The "Encajar" Workspace)

* **Translation:** Drag to move the image on the X/Y axis.
* **Scale:** Pinch-to-zoom to match the canvas size.
* **Rotation:** Two-finger rotation for leveling the image.
* **Reset Button:** Quickly return the image to the center at 1:1 scale.

#### 3.3 Preset System

* **Save Configuration:** Save the `translateX`, `translateY`, `scale`, and `rotation` values into a named preset.
* **Recall Configuration:** Selecting a preset instantly applies the stored coordinates to the selected image.

---

### 4. Technical Architecture (React Native)

To achieve smooth performance, we will use a declarative gesture system.

**Key Libraries:**

* **`react-native-reanimated`:** For 60fps animations and transformations.
* **`react-native-gesture-handler`:** To capture pinch, pan, and rotation gestures.
* **`@react-native-async-storage/async-storage`:** To save the JSON objects containing the preset data.

#### Proposed Data Structure for Presets:

```json
{
  "id": "project_01",
  "name": "Landscape Study - Main Canvas",
  "imageUri": "file://...",
  "transform": {
    "x": 102.5,
    "y": -45.0,
    "scale": 1.45,
    "rotation": 0.05
  }
}

```

---

### 5. User Interface & Workflow

| Screen | Purpose |
| --- | --- |
| **Library Screen** | View saved presets or start a "New Alignment." |
| **Workspace** | The "Projector Mode." Dark background to reduce light bleed, full-screen image display with gesture controls. |
| **Controls Overlay** | Transparent buttons to "Lock" the image (disable gestures) or "Save Preset." |

---

### 6. User Workflow Diagrams

#### Workflow 1: Calibration (The First Setup)

1. User opens app and selects **New Project**.
2. Selects reference photo.
3. **The "Match":** User moves/scales the photo on the phone until the projected light hits the canvas edges perfectly.
4. User taps **Save Preset**.

#### Workflow 2: Resuming Work (The "Recall")

1. User sets up the physical projector in the same spot as yesterday.
2. Opens **ProjectAlign** and selects the saved preset.
3. The image snaps to the exact X, Y, and Scale coordinates.
4. If the projector is slightly off, the user makes a tiny adjustment and **Updates** the preset.

---

### 7. Future Considerations (V2)

* **Keystone Correction:** Adding a 4-point warp tool to correct perspective if the projector isn't perfectly perpendicular to the canvas.
* **Grid Overlay:** A toggleable rule-of-thirds or perspective grid.
* **Opacity Toggle:** Allowing the artist to "blink" the image on and off to check their progress against the reference.

---

**Would you like me to provide the basic React Native code structure for the Gesture Handler to get the image manipulation working?**