import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { theme } from '../styles/theme';
import { TransformState } from '../store/useProjectStore';

interface AlignmentWorkspaceProps {
  imageUri: string | null;
  isProjectionMode: boolean;
  initialTransform?: TransformState;
  onTransformChange?: (transform: TransformState) => void;
  onLongPress?: () => void;
}

export const AlignmentWorkspace: React.FC<AlignmentWorkspaceProps> = ({ 
  imageUri, 
  isProjectionMode,
  initialTransform,
  onTransformChange,
  onLongPress
}) => {
  const isInitialized = useRef(false);

  // Shared values for transformations
  const translationX = useSharedValue(initialTransform?.translationX ?? 0);
  const translationY = useSharedValue(initialTransform?.translationY ?? 0);
  const scale = useSharedValue(initialTransform?.scale ?? 1);
  const savedScale = useSharedValue(initialTransform?.scale ?? 1);
  const rotation = useSharedValue(initialTransform?.rotation ?? 0);
  const savedRotation = useSharedValue(initialTransform?.rotation ?? 0);

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

  // Gesture definitions
  const pan = Gesture.Pan()
    .enabled(!isProjectionMode)
    .onChange((event) => {
      translationX.value += event.changeX;
      translationY.value += event.changeY;
    })
    .onEnd(() => {
      runOnJS(notifyTransformChange)();
    });

  const pinch = Gesture.Pinch()
    .enabled(!isProjectionMode)
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(notifyTransformChange)();
    });

  const rotate = Gesture.Rotation()
    .enabled(!isProjectionMode)
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(notifyTransformChange)();
    });

  const longPress = Gesture.LongPress()
    .minDuration(2000)
    .onStart(() => {
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    });

  // Compose gestures for simultaneous execution
  const composed = Gesture.Simultaneous(pan, pinch, rotate, longPress);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
      ],
    };
  });

  const handleReset = () => {
    translationX.value = withSpring(0);
    translationY.value = withSpring(0);
    scale.value = withSpring(1);
    savedScale.value = 1;
    rotation.value = withSpring(0);
    savedRotation.value = 0;
    // Notify after reset with default values
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No image selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={styles.workspace}>
          <Animated.View style={[
            styles.imageContainer, 
            animatedStyle,
            !isProjectionMode && styles.editIndicator
          ]}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image} 
              resizeMode="contain" 
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {!isProjectionMode && (
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000', 
  },
  workspace: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  editIndicator: {
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
  },
});
