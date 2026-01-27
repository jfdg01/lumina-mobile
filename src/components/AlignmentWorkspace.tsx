import React, { useEffect, useRef } from 'react';
import { View, Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { TransformState } from '@/types/project';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { 
  ChevronLeft, 
  Undo2, 
  Redo2, 
  Maximize, 
  Lock, 
  EyeOff, 
  RotateCcw 
} from 'lucide-react-native';

interface AlignmentWorkspaceProps {
  imageUri: string | null;
  isProjectionMode: boolean;
  showSecondaryControls: boolean;
  initialTransform?: TransformState;
  onTransformChange?: (transform: TransformState) => void;
  onLongPress?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExit?: () => void;
  onToggleProjection?: () => void;
  onHideControls?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const AlignmentWorkspace: React.FC<AlignmentWorkspaceProps> = ({ 
  imageUri, 
  isProjectionMode,
  showSecondaryControls,
  initialTransform,
  onTransformChange,
  onLongPress,
  onUndo,
  onRedo,
  onExit,
  onToggleProjection,
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
    .minDuration(1500) // Slightly shorter for better UX
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
        <Text className="text-typography-500 text-lg font-medium">No image selected</Text>
      </Box>
    );
  }

  const glassStyle = "bg-background-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden";
  const iconButtonStyle = "w-12 h-12 rounded-xl  items-center justify-center active:bg-white/10";

  return (
    <Box className="flex-1 w-full overflow-hidden bg-black">
      <GestureDetector gesture={composed}>
        <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={[
            {
              width: 300,
              height: 300,
              justifyContent: 'center',
              alignItems: 'center',
            },
            animatedStyle,
            !isProjectionMode && { borderStyle: 'dashed', borderWidth: 1, borderColor: '#3b82f6' }
          ]}>
            <Image 
              source={{ uri: imageUri }} 
              style={{ width: '100%', height: '100%' }} 
              resizeMode="contain" 
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* Workspace Overlays */}
      <Box className="absolute inset-0 pointer-events-none" pointerEvents="box-none">
        
        {/* Top Bar Controls */}
        {(!isProjectionMode || showSecondaryControls) && (
          <HStack className="absolute top-12 left-5 right-5 justify-between items-center" pointerEvents="box-none">
            {/* Exit/Back Button */}
            <Box className={glassStyle} pointerEvents="auto">
               <Button className={iconButtonStyle} onPress={onExit} variant="link">
                 <ButtonIcon as={ChevronLeft} className="text-typography-0" size="xl" />
               </Button>
            </Box>

            {/* Undo/Redo Group */}
            {!isProjectionMode && (
              <HStack className={glassStyle} pointerEvents="auto">
                <Button 
                  className={`${iconButtonStyle} ${!canUndo ? 'opacity-20' : ''}`} 
                  onPress={onUndo}
                  disabled={!canUndo}
                  variant="link"
                >
                  <ButtonIcon as={Undo2} className="text-typography-0" size="lg" />
                </Button>
                <Box className="w-[1px] h-8 bg-white/10 self-center" />
                <Button 
                  className={`${iconButtonStyle} ${!canRedo ? 'opacity-20' : ''}`} 
                  onPress={onRedo}
                  disabled={!canRedo}
                  variant="link"
                >
                  <ButtonIcon as={Redo2} className="text-typography-0" size="lg" />
                </Button>
              </HStack>
            )}

            {/* View Mode Indicator / Hide Controls (if in projection revealed) */}
            {isProjectionMode && showSecondaryControls && (
               <Box className={glassStyle} pointerEvents="auto">
                 <Button className={iconButtonStyle} onPress={onHideControls} variant="link">
                   <ButtonIcon as={EyeOff} className="text-typography-500" size="lg" />
                 </Button>
               </Box>
            )}
          </HStack>
        )}

        {/* Bottom Bar Controls */}
        <HStack className="absolute bottom-10 left-5 right-5 justify-between items-end" pointerEvents="box-none">
          {/* Projection Mode Toggle - Always accessible but subtle in projection mode */}
          <Box 
            className={`${glassStyle} transition-all duration-300 ${isProjectionMode && !showSecondaryControls ? 'opacity-20 scale-90 translate-y-2' : 'opacity-100'}`} 
            pointerEvents="auto"
          >
            <Button 
              onPress={onToggleProjection}
              className={`h-14 px-6 rounded-xl ${isProjectionMode ? 'bg-transparent' : 'bg-primary-500'}`}
              variant={isProjectionMode ? 'outline' : 'solid'}
              action={isProjectionMode ? 'secondary' : 'primary'}
            >
              <ButtonIcon as={isProjectionMode ? Lock : Maximize} className={isProjectionMode ? "text-typography-0" : "text-black"} />
              <ButtonText className={`ml-2 font-bold uppercase tracking-wider ${isProjectionMode ? 'text-typography-0' : 'text-black'}`}>
                {isProjectionMode ? 'Unlock' : 'Project'}
              </ButtonText>
            </Button>
          </Box>

          {/* Reset / Helper Button - Only in Edit Mode or when controls are revealed */}
          {(!isProjectionMode || showSecondaryControls) && (
            <Animated.View 
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
            >
              <Box className={glassStyle} pointerEvents="auto">
                <Button className={iconButtonStyle} onPress={handleReset} variant="link">
                  <ButtonIcon as={RotateCcw} className="text-typography-0" size="lg" />
                </Button>
              </Box>
            </Animated.View>
          )}
        </HStack>
      </Box>
    </Box>
  );
};
