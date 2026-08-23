import React, { useEffect, useState } from 'react';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar, Platform, Text, View } from 'react-native';

import { TransformState } from '@/types/project';
import { AxisLock, GestureHandler } from './GestureHandler';
import { WorkspaceControls } from './WorkspaceControls';
import { TransformFields } from './TransformFields';
import { Grid } from './Grid';

interface AlignmentWorkspaceProps {
  imageUri: string | null;
  isEditMode: boolean;
  showSecondaryControls: boolean;
  initialTransform: TransformState;
  onTransformChange: (transform: TransformState) => void;
  onLongPress: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExit: () => void;
  onToggleEditMode: () => void;
  onHideControls: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  canUndo,
  canRedo,
}) => {
  // Shared values for transformations
  const translationX = useSharedValue(initialTransform.translationX);
  const translationY = useSharedValue(initialTransform.translationY);
  const scale = useSharedValue(initialTransform.scale);
  const savedScale = useSharedValue(initialTransform.scale);
  const rotation = useSharedValue(initialTransform.rotation);
  const savedRotation = useSharedValue(initialTransform.rotation);
  const baseRotation = initialTransform.baseRotation ?? 0;
  const [axisLock, setAxisLock] = useState<AxisLock>('free');

  // Hide the system bars in view mode while the controls are hidden
  useEffect(() => {
    const shouldHide = !isEditMode && !showSecondaryControls;
    StatusBar.setHidden(shouldHide, 'fade');
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync(shouldHide ? 'hidden' : 'visible');
      if (shouldHide) NavigationBar.setBehaviorAsync('overlay-swipe');
    }
    return () => {
      StatusBar.setHidden(false);
      if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('visible');
    };
  }, [isEditMode, showSecondaryControls]);

  // Push the saved transform into the shared values (on load and on undo/redo)
  useEffect(() => {
    translationX.value = initialTransform.translationX;
    translationY.value = initialTransform.translationY;
    scale.value = savedScale.value = initialTransform.scale;
    rotation.value = savedRotation.value = initialTransform.rotation;
  }, [initialTransform]);

  // Report the live transform to the parent, with optional overrides
  const emit = (patch: Partial<TransformState> = {}) =>
    onTransformChange({
      translationX: translationX.value,
      translationY: translationY.value,
      scale: scale.value,
      rotation: rotation.value,
      baseRotation,
      ...patch,
    });

  const handleReset = () => {
    translationX.value = withSpring(0);
    translationY.value = withSpring(0);
    scale.value = withSpring(1);
    savedScale.value = 1;
    rotation.value = withSpring(0);
    savedRotation.value = 0;
    // baseRotation survives reset: the projector did not physically move
    emit({ translationX: 0, translationY: 0, scale: 1, rotation: 0 });
  };

  if (!imageUri) {
    return (
      <View className="flex-1 justify-center items-center bg-background-950">
        <Text className="text-typography-500 text-lg font-medium">Ninguna imagen seleccionada</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 w-full overflow-hidden bg-black">
      {/* Edit mode only: a grid on the wall would get painted */}
      {isEditMode && <Grid translationX={translationX} translationY={translationY} scale={scale} rotation={rotation} />}
      <GestureHandler
        imageUri={imageUri}
        isEditMode={isEditMode}
        translationX={translationX}
        translationY={translationY}
        scale={scale}
        savedScale={savedScale}
        rotation={rotation}
        savedRotation={savedRotation}
        baseRotation={baseRotation}
        axisLock={axisLock}
        onTransformChange={() => emit()}
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
        onRotate90={() => emit({ baseRotation: (baseRotation + 90) % 360 })}
        axisLock={axisLock}
        onCycleAxisLock={() => setAxisLock({ free: 'x', x: 'y', y: 'free' }[axisLock] as AxisLock)}
        fields={
          <TransformFields
            translationX={translationX}
            translationY={translationY}
            scale={scale}
            rotation={rotation}
            baseRotation={baseRotation}
            onSet={emit}
          />
        }
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </View>
  );
};
