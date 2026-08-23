import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Undo2, 
  Redo2, 
  Maximize, 
  EyeOff,
  Pencil,
  Check,
  RotateCcw,
  RotateCw
} from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface WorkspaceControlsProps {
  isEditMode: boolean;
  showSecondaryControls: boolean;
  onExit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleEditMode?: () => void;
  onHideControls?: () => void;
  onReset: () => void;
  onRotate90: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const WorkspaceControls: React.FC<WorkspaceControlsProps> = ({
  isEditMode,
  showSecondaryControls,
  onExit,
  onUndo,
  onRedo,
  onToggleEditMode,
  onHideControls,
  onReset,
  onRotate90,
  canUndo,
  canRedo,
}) => {
  const insets = useSafeAreaInsets();
  const flatPanelStyle = "bg-background-950 border border-outline-800 rounded-none p-1 shadow-none overflow-hidden";
  const iconButtonStyle = "w-12 h-12 rounded-none items-center justify-center active:bg-background-800";

  // View Mode: controls hidden unless long-press reveals them
  // Edit Mode: controls always visible
  const showTopControls = isEditMode || showSecondaryControls;

  return (
    <Box 
      className="absolute" 
      style={{
        top: insets.top,
        bottom: insets.bottom,
        left: insets.left,
        right: insets.right,
      }}
      pointerEvents="box-none"
    >
      
      {/* Top Bar Controls - animated in View Mode */}
      {showTopControls && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="absolute top-2 left-5 right-5"
          pointerEvents="box-none"
        >
          <HStack className="justify-between items-center" pointerEvents="box-none">
            {/* Exit/Back Button */}
            <Box className={flatPanelStyle} pointerEvents="auto">
               <Button className="h-12 px-4 rounded-none flex-row items-center justify-center active:bg-background-800" onPress={onExit} variant="link">
                 <ButtonIcon as={ChevronLeft} className="text-typography-0" size="xl" />
                 <ButtonText className="ml-1 text-typography-0 font-medium">Volver</ButtonText>
               </Button>
            </Box>

            {/* Undo/Redo Group - only in Edit Mode */}
            {isEditMode && (
              <HStack className={flatPanelStyle} pointerEvents="auto">
                <Button 
                  className={`${iconButtonStyle} ${!canUndo ? 'opacity-20' : ''}`} 
                  onPress={onUndo}
                  disabled={!canUndo}
                  variant="link"
                >
                  <ButtonIcon as={Undo2} className="text-typography-0" size="lg" />
                </Button>
                <Box className="w-[1px] h-8 bg-outline-800 self-center" />
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

            {/* Edit/Done Button - Moved to Top Right */}
            <Box className={flatPanelStyle} pointerEvents="auto">
              <Button 
                onPress={onToggleEditMode}
                className="h-12 px-4 rounded-none bg-primary-500 active:bg-primary-600 flex-row items-center justify-center"
                variant="solid"
                action="primary"
              >
                <ButtonIcon as={!isEditMode ? Pencil : Check} className="text-black" />
                <ButtonText className="ml-2 font-bold uppercase tracking-wider text-black">
                  {!isEditMode ? 'Editar' : 'Listo'}
                </ButtonText>
              </Button>
            </Box>
          </HStack>
        </Animated.View>
      )}

      {/* Bottom Bar Controls */}
      <HStack className="absolute bottom-4 left-5 right-5 justify-between items-end" pointerEvents="box-none">
        
        {/* Hide Controls Button - Moved to Bottom Left */}
        {/* Only show in View Mode when controls are revealed */}
        {!isEditMode && showSecondaryControls && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <Box className={flatPanelStyle} pointerEvents="auto">
               <Button className="h-12 px-4 rounded-none flex-row items-center justify-center active:bg-background-800" onPress={onHideControls} variant="link">
                 <ButtonIcon as={EyeOff} className="text-typography-500" size="lg" />
                 <ButtonText className="ml-2 text-typography-500 font-medium">Ocultar</ButtonText>
               </Button>
            </Box>
          </Animated.View>
        )}

        {/* Spacer if Hide button is not visible but Reset might be? 
            Actually, justify-between handles it. If Hide is gone, Reset stays right. 
            If Reset is gone (View Mode), and Hide is there, Hide stays left.
        */}

        {/* Rotate 90° (projector orientation) + Reset - only in Edit Mode */}
        {isEditMode && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <Box className={flatPanelStyle} pointerEvents="auto">
              <Button className="h-12 px-4 rounded-none flex-row items-center justify-center active:bg-background-800" onPress={onRotate90} variant="link">
                <ButtonIcon as={RotateCw} className="text-typography-0" size="lg" />
                <ButtonText className="ml-2 text-typography-0 font-medium">Girar 90°</ButtonText>
              </Button>
            </Box>
          </Animated.View>
        )}

        {/* Reset Button - only in Edit Mode */}
        {isEditMode && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            className="ml-auto" // Push to right if alone
          >
            <Box className={flatPanelStyle} pointerEvents="auto">
              <Button className="h-12 px-4 rounded-none flex-row items-center justify-center active:bg-background-800" onPress={onReset} variant="link">
                <ButtonIcon as={RotateCcw} className="text-typography-0" size="lg" />
                <ButtonText className="ml-2 text-typography-0 font-medium">Reset</ButtonText>
              </Button>
            </Box>
          </Animated.View>
        )}
      </HStack>
    </Box>
  );
};

