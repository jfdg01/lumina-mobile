import React, { useEffect } from 'react';
import { useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';

import { TransformState } from '@/types/project';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

import { GestureHandler } from './GestureHandler';
import { WorkspaceControls } from './WorkspaceControls';

import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar, Platform } from 'react-native';

interface AlignmentWorkspaceProps {
  imageUri: string | null;
  isEditMode: boolean;
  showSecondaryControls: boolean;
  initialTransform?: TransformState;
  onTransformChange?: (transform: TransformState) => void;
  onLongPress?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExit?: () => void;
  onToggleEditMode?: () => void;
  onHideControls?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const AlignmentWorkspace: React.FC<AlignmentWorkspaceProps> = ({ 
  imageUri, 
  isEditMode,
  showSecondaryControls,
  initialTransform,
  onTransformChange,
  onLongPress,
  onUndo,
  onRedo,
  onExit,
  onToggleEditMode,
  onHideControls,
  canUndo = false,
  canRedo = false,
}) => {
  // Shared values for transformations
  const translationX = useSharedValue(initialTransform?.translationX ?? 0);
  const translationY = useSharedValue(initialTransform?.translationY ?? 0);
  const scale = useSharedValue(initialTransform?.scale ?? 1);
  const savedScale = useSharedValue(initialTransform?.scale ?? 1);
  const rotation = useSharedValue(initialTransform?.rotation ?? 0);
  const savedRotation = useSharedValue(initialTransform?.rotation ?? 0);

  // Manage System Bars Visibility
  useEffect(() => {
    const manageSystemBars = async () => {
      // Hide if in view mode (not edit mode) AND controls are NOT shown
      const shouldHide = !isEditMode && !showSecondaryControls;

      if (Platform.OS === 'android') {
        if (shouldHide) {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          StatusBar.setHidden(true, 'fade');
        } else {
          await NavigationBar.setVisibilityAsync('visible');
          StatusBar.setHidden(false, 'fade');
        }
      } else {
        // iOS only has StatusBar to hide (navigation bar/home indicator is system controlled)
        StatusBar.setHidden(shouldHide, 'fade');
      }
    };

    manageSystemBars();

    // Cleanup: ensure visible on unmount
    return () => {
       if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
       }
       StatusBar.setHidden(false);
    };
  }, [isEditMode, showSecondaryControls]);

  // Update shared values when initialTransform changes (e.g., on load or undo/redo)
  useEffect(() => {
    if (initialTransform) {
      translationX.value = initialTransform.translationX;
      translationY.value = initialTransform.translationY;
      scale.value = initialTransform.scale;
      savedScale.value = initialTransform.scale;
      rotation.value = initialTransform.rotation;
      savedRotation.value = initialTransform.rotation;
    }
  }, [initialTransform]);

  // Helper to notify parent of transform changes
  const notifyTransformChange = () => {
    if (onTransformChange) {
      onTransformChange({
        translationX: translationX.value,
        translationY: translationY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    }
  };

  const handleReset = () => {
    translationX.value = withSpring(0);
    translationY.value = withSpring(0);
    scale.value = withSpring(1);
    savedScale.value = 1;
    rotation.value = withSpring(0);
    savedRotation.value = 0;
    
    if (onTransformChange) {
      onTransformChange({
        translationX: 0,
        translationY: 0,
        scale: 1,
        rotation: 0,
      });
    }
  };

  if (!imageUri) {
    return (
      <Box className="flex-1 justify-center items-center bg-background-950">
        <Text className="text-typography-500 text-lg font-medium">Ninguna imagen seleccionada</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 w-full overflow-hidden bg-black">
      <GestureHandler
        imageUri={imageUri}
        isEditMode={isEditMode}
        translationX={translationX}
        translationY={translationY}
        scale={scale}
        savedScale={savedScale}
        rotation={rotation}
        savedRotation={savedRotation}
        onTransformChange={notifyTransformChange}
        onLongPress={onLongPress}
        enableLongPress={!isEditMode && !showSecondaryControls}
      />

      <WorkspaceControls
        isEditMode={isEditMode}
        showSecondaryControls={showSecondaryControls}
        onExit={onExit}
        onUndo={onUndo}
        onRedo={onRedo}
        onToggleEditMode={onToggleEditMode}
        onHideControls={onHideControls}
        onReset={handleReset}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </Box>
  );
};
