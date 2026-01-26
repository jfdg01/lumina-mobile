import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { theme } from '../styles/theme';

interface AlignmentWorkspaceProps {
  imageUri: string | null;
  isProjectionMode: boolean;
}

export const AlignmentWorkspace: React.FC<AlignmentWorkspaceProps> = ({ 
  imageUri, 
  isProjectionMode 
}) => {
  // Shared values for transformations
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  // Gesture definitions
  const pan = Gesture.Pan()
    .enabled(!isProjectionMode)
    .onChange((event) => {
      translationX.value += event.changeX;
      translationY.value += event.changeY;
    });

  const pinch = Gesture.Pinch()
    .enabled(!isProjectionMode)
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotate = Gesture.Rotation()
    .enabled(!isProjectionMode)
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  // Compose gestures for simultaneous execution
  const composed = Gesture.Simultaneous(pan, pinch, rotate);

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
      <View style={styles.workspace}>
        <GestureDetector gesture={composed}>
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
        </GestureDetector>
      </View>

      {!isProjectionMode && (
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset Transform</Text>
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
    backgroundColor: '#000', // Ensure contrast
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
    backgroundColor: '#1a1a1a',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
  imageContainer: {
    // Initial size constraints to prevent massive layout shifts
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
  },
  resetButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  editIndicator: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
  },
});
