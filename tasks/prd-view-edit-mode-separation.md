# PRD: View/Edit Mode Separation

## Introduction

Refactor the project workspace flow to clearly separate **View Mode** (projection/display) and **Edit Mode** (image manipulation). Currently, opening a project immediately enters Edit Mode, which allows accidental image manipulation. The new flow ensures users start in a non-editable View Mode and must intentionally activate Edit Mode.

## Goals

- Prevent accidental image manipulation by defaulting to View Mode
- Require a deliberate 2-second long-press to reveal workspace controls
- Provide clear navigation between View Mode and Edit Mode
- Remove the existing "Unlock/Project" toggle button approach
- Maintain keep-awake functionality in View Mode for projection use

## User Stories

### US-001: Default to View Mode on Project Open
**Description:** As a user, I want to open a project directly into View Mode so that I don't accidentally move or resize my aligned image.

**Acceptance Criteria:**
- [ ] Opening a project routes to View Mode (no controls visible)
- [ ] Image is displayed but not editable (pan/pinch/rotate gestures disabled)
- [ ] Screen keeps awake while in View Mode
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-002: Long-Press to Reveal Controls
**Description:** As a user, I want to long-press (2 seconds) anywhere on the screen to reveal navigation controls so I can access options without accidentally editing.

**Acceptance Criteria:**
- [ ] Long-pressing anywhere for 2 seconds reveals control overlay
- [ ] Controls fade in with animation
- [ ] Controls include: "Back" button (returns to project list) and "Edit" button (enters Edit Mode)
- [ ] Tapping outside controls or pressing a "hide" button hides controls again
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-003: Enter Edit Mode from Controls
**Description:** As a user, I want to tap an "Edit" button from the revealed controls to enter Edit Mode where I can manipulate the image.

**Acceptance Criteria:**
- [ ] "Edit" button is visible in the revealed controls overlay
- [ ] Tapping "Edit" enters Edit Mode with full editing controls (undo, redo, reset)
- [ ] Image editing gestures (pan, pinch, rotate) are enabled in Edit Mode
- [ ] Edit Mode shows visual indicator (dashed border around image)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-004: Exit Edit Mode to View Mode
**Description:** As a user, I want to tap a "Done" button to exit Edit Mode and return to View Mode so I can view my aligned image without risk of editing.

**Acceptance Criteria:**
- [ ] "Done" button is visible in Edit Mode controls
- [ ] Tapping "Done" exits Edit Mode and returns to View Mode
- [ ] Transform changes are saved before exiting Edit Mode
- [ ] Controls are hidden upon returning to View Mode
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-005: Remove Legacy Unlock/Project Toggle
**Description:** As a developer, I need to remove the old "Unlock/Project" toggle button that conflates View and Edit modes.

**Acceptance Criteria:**
- [ ] "Unlock/Project" button is removed from `WorkspaceControls.tsx`
- [ ] Related state (`isProjectionMode` toggle logic) is refactored to new mode system
- [ ] No TypeScript errors
- [ ] Typecheck passes

---

## Functional Requirements

- FR-1: When a project is selected from the project list, route to View Mode (not Edit Mode)
- FR-2: In View Mode, all editing gestures (pan, pinch, rotate) are disabled
- FR-3: In View Mode, a 2-second long-press anywhere on screen reveals the controls overlay
- FR-4: The controls overlay shows a "Back" button and an "Edit" button
- FR-5: Tapping "Edit" transitions to Edit Mode with full editing controls
- FR-6: In Edit Mode, display undo, redo, reset, and "Done" buttons
- FR-7: Tapping "Done" saves changes and returns to View Mode (controls hidden)
- FR-8: Tapping "Back" from either mode returns to the project list
- FR-9: Screen keep-awake is active in View Mode
- FR-10: Remove the legacy "Unlock/Project" toggle button

## Non-Goals

- No changes to the project list UI
- No changes to the image import flow
- No changes to how transform data is stored/persisted
- No "Edit" button in the project list (users must open project first, then long-press)
- No auto-save timer while editing (save only on "Done" or gesture end)

## Design Considerations

### State Machine

```
[Project List] → (select project) → [View Mode]
                                          ↓ (long-press 2s)
                                    [Controls Revealed]
                                          ↓ (tap Edit)
                                    [Edit Mode]
                                          ↓ (tap Done)
                                    [View Mode]
```

### UI Changes

| Current | New |
|---------|-----|
| "Unlock/Project" toggle button | Removed |
| Controls always visible in edit | Controls hidden by default, revealed via long-press |
| Instant edit on project open | View-only on project open |

### Components to Modify

- `App.tsx` - Add new state: `viewMode: 'viewing' | 'controlsRevealed' | 'editing'`
- `AlignmentWorkspace.tsx` - Accept new mode prop, disable gestures in viewing mode
- `GestureHandler.tsx` - Respect new mode for gesture enabling
- `WorkspaceControls.tsx` - Redesign controls for new flow

## Technical Considerations

- The existing `isProjectionMode` boolean should be replaced with a tri-state enum
- Long-press detection already exists (1.5s), needs extension to 2s
- Keep existing undo/redo stack logic unchanged
- Keep-awake should activate in View Mode (same as current projection mode)

## Success Metrics

- Zero accidental image movements when viewing a project
- Clear user flow from view → edit → view
- No regression in existing edit functionality

## Open Questions

- Should there be haptic feedback when controls are revealed? (deferred to future)
- Should the long-press duration be configurable? (out of scope for now)
