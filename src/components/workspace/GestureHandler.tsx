import React from 'react';
import { Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  SharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  withTiming,
  useSharedValue,
  runOnJS 
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import { Box } from '@/components/ui/box';

interface GestureHandlerProps {
  imageUri: string;
  isEditMode: boolean;
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  scale: SharedValue<number>;
  savedScale: SharedValue<number>;
  rotation: SharedValue<number>;
  savedRotation: SharedValue<number>;
  baseRotation: number;
  onTransformChange: () => void;
  onLongPress?: () => void;
  enableLongPress?: boolean;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({
  imageUri,
  isEditMode,
  translationX,
  translationY,
  scale,
  savedScale,
  rotation,
  savedRotation,
  baseRotation,
  onTransformChange,
  onLongPress,
  enableLongPress = true,
}) => {
  // Visual feedback state
  const isPressing = useSharedValue(false);
  const progress = useSharedValue(0);
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);

  // Constants for the circle
  const RADIUS = 40;
  const STROKE_WIDTH = 4;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Gesture definitions
  const pan = Gesture.Pan()
    .enabled(isEditMode)
    .onChange((event) => {
      translationX.value += event.changeX;
      translationY.value += event.changeY;
    })
    .onEnd(() => {
      runOnJS(onTransformChange)();
    });

  const pinch = Gesture.Pinch()
    .enabled(isEditMode)
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(onTransformChange)();
    });

  const rotate = Gesture.Rotation()
    .enabled(isEditMode)
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(onTransformChange)();
    });

  const longPress = Gesture.LongPress()
    .enabled(enableLongPress)
    .minDuration(2000)
    .onBegin((event) => {
      // Start visual feedback
      touchX.value = event.x;
      touchY.value = event.y;
      isPressing.value = true;
      progress.value = withTiming(1, { duration: 2000 });
    })
    .onStart(() => {
      // Trigger action
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
      // Reset after successful trigger
      isPressing.value = false;
      progress.value = 0;
    })
    .onFinalize(() => {
      // Reset if interrupted or failed
      isPressing.value = false;
      progress.value = 0;
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

  const circleStyle = useAnimatedStyle(() => {
    return {
      opacity: isPressing.value ? 1 : 0,
      transform: [
        { translateX: touchX.value - RADIUS - STROKE_WIDTH },
        { translateY: touchY.value - RADIUS - STROKE_WIDTH },
      ],
    };
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View className="flex-1 justify-center items-center">
        {/* Visual Feedback Overlay */}
        <Animated.View 
          style={[{ position: 'absolute', top: 0, left: 0, zIndex: 100 }, circleStyle]} 
          pointerEvents="none"
        >
          <Svg width={(RADIUS + STROKE_WIDTH) * 2} height={(RADIUS + STROKE_WIDTH) * 2}>
            {/* Background Circle */}
            <Circle
              cx={RADIUS + STROKE_WIDTH}
              cy={RADIUS + STROKE_WIDTH}
              r={RADIUS}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Progress Circle */}
            <AnimatedCircle
              cx={RADIUS + STROKE_WIDTH}
              cy={RADIUS + STROKE_WIDTH}
              r={RADIUS}
              stroke="#ffffff"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedProps}
              strokeLinecap="round"
              transform={`rotate(-90 ${RADIUS + STROKE_WIDTH} ${RADIUS + STROKE_WIDTH})`}
            />
          </Svg>
        </Animated.View>

        <Animated.View 
          className={`w-[300px] h-[300px] justify-center items-center border ${isEditMode ? 'border-dashed border-primary-500' : 'border-transparent'}`}
          style={animatedStyle}
        >
          {/* baseRotation on the inner image (square box), so pan gestures stay in screen coordinates */}
          <Image
            source={{ uri: imageUri }}
            className="w-full h-full"
            style={{ transform: [{ rotate: `${baseRotation}deg` }] }}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
