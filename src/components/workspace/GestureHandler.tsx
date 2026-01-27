import React from 'react';
import { Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  SharedValue, 
  useAnimatedStyle, 
  runOnJS 
} from 'react-native-reanimated';
import { Box } from '@/components/ui/box';

interface GestureHandlerProps {
  imageUri: string;
  isProjectionMode: boolean;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  scale: SharedValue<number>;
  savedScale: SharedValue<number>;
  rotation: SharedValue<number>;
  savedRotation: SharedValue<number>;
  onTransformChange: () => void;
  onLongPress?: () => void;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({
  imageUri,
  isProjectionMode,
  translationX,
  translationY,
  scale,
  savedScale,
  rotation,
  savedRotation,
  onTransformChange,
  onLongPress,
}) => {
  // Gesture definitions
  const pan = Gesture.Pan()
    .enabled(!isProjectionMode)
    .onChange((event) => {
      translationX.value += event.changeX;
      translationY.value += event.changeY;
    })
    .onEnd(() => {
      runOnJS(onTransformChange)();
    });

  const pinch = Gesture.Pinch()
    .enabled(!isProjectionMode)
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(onTransformChange)();
    });

  const rotate = Gesture.Rotation()
    .enabled(!isProjectionMode)
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(onTransformChange)();
    });

  const longPress = Gesture.LongPress()
    .minDuration(1500)
    .onStart(() => {
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    });

  const composed = Gesture.Simultaneous(pan, pinch, rotate, longPress);

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

  return (
    <GestureDetector gesture={composed}>
      <Animated.View className="flex-1 justify-center items-center">
        <Animated.View 
          className={`w-[300px] h-[300px] justify-center items-center ${!isProjectionMode ? 'border-dashed border border-primary-500' : ''}`}
          style={animatedStyle}
        >
          <Image 
            source={{ uri: imageUri }} 
            className="w-full h-full"
            resizeMode="contain" 
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
