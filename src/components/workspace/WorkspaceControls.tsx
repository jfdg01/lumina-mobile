import React from 'react';
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
  RotateCcw 
} from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface WorkspaceControlsProps {
  isProjectionMode: boolean;
  showSecondaryControls: boolean;
  onExit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleProjection?: () => void;
  onHideControls?: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const WorkspaceControls: React.FC<WorkspaceControlsProps> = ({
  isProjectionMode,
  showSecondaryControls,
  onExit,
  onUndo,
  onRedo,
  onToggleProjection,
  onHideControls,
  onReset,
  canUndo,
  canRedo,
}) => {
  const flatPanelStyle = "bg-background-950 border border-outline-800 rounded-none p-1 shadow-none overflow-hidden";
  const iconButtonStyle = "w-12 h-12 rounded-none items-center justify-center active:bg-background-800";
  const primaryButtonStyle = "h-14 px-6 rounded-none bg-primary-500 active:bg-primary-600";

  // View Mode: controls hidden unless long-press reveals them
  // Edit Mode: controls always visible
  const showTopControls = !isProjectionMode || showSecondaryControls;

  return (
    <Box className="absolute inset-0" pointerEvents="box-none">
      
      {/* Top Bar Controls - animated in View Mode */}
      {showTopControls && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="absolute top-12 left-5 right-5"
          pointerEvents="box-none"
        >
          <HStack className="justify-between items-center" pointerEvents="box-none">
            {/* Exit/Back Button */}
            <Box className={flatPanelStyle} pointerEvents="auto">
               <Button className={iconButtonStyle} onPress={onExit} variant="link">
                 <ButtonIcon as={ChevronLeft} className="text-typography-0" size="xl" />
               </Button>
            </Box>

            {/* Undo/Redo Group - only in Edit Mode */}
            {!isProjectionMode && (
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

            {/* Hide Controls button - only in View Mode when controls revealed */}
            {isProjectionMode && showSecondaryControls && (
               <Box className={flatPanelStyle} pointerEvents="auto">
                 <Button className={iconButtonStyle} onPress={onHideControls} variant="link">
                   <ButtonIcon as={EyeOff} className="text-typography-500" size="lg" />
                 </Button>
               </Box>
            )}
          </HStack>
        </Animated.View>
      )}

      {/* Bottom Bar Controls */}
      <HStack className="absolute bottom-10 left-5 right-5 justify-between items-end" pointerEvents="box-none">
        
        {/* Mode Action Button */}
        {/* View Mode with controls: Show "Edit" button */}
        {/* Edit Mode: Show "Done" button */}
        {/* View Mode without controls: Hidden */}
        {(showSecondaryControls || !isProjectionMode) && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <Box className={flatPanelStyle} pointerEvents="auto">
              <Button 
                onPress={onToggleProjection}
                className={primaryButtonStyle}
                variant="solid"
                action="primary"
              >
                <ButtonIcon as={isProjectionMode ? Pencil : Check} className="text-black" />
                <ButtonText className="ml-2 font-black uppercase tracking-wider text-black">
                  {isProjectionMode ? 'Edit' : 'Done'}
                </ButtonText>
              </Button>
            </Box>
          </Animated.View>
        )}

        {/* Reset Button - only when controls visible */}
        {showTopControls && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <Box className={flatPanelStyle} pointerEvents="auto">
              <Button className={iconButtonStyle} onPress={onReset} variant="link">
                <ButtonIcon as={RotateCcw} className="text-typography-0" size="lg" />
              </Button>
            </Box>
          </Animated.View>
        )}
      </HStack>
    </Box>
  );
};

