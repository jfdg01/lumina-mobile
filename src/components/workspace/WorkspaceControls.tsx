import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ink } from '@/components/ui';
import { ChevronLeft, Undo2, Redo2, EyeOff, Pencil, Check, RotateCcw, RotateCw, LucideIcon } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface WorkspaceControlsProps {
  isEditMode: boolean;
  showSecondaryControls: boolean;
  onExit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleEditMode: () => void;
  onHideControls: () => void;
  onReset: () => void;
  onRotate90: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const panel = 'bg-background-950 border border-outline-800 p-1 overflow-hidden';
const iconButton = 'w-12 h-12';

// A white panel with one labelled button. Fades in and out.
const Panel = ({ icon: Icon, label, onPress, color = ink.dark, className = '' }:
  { icon: LucideIcon; label: string; onPress: () => void; color?: string; className?: string }) => (
  <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} className={className}>
    <View className={panel} pointerEvents="auto">
      <Button variant="link" className="h-12 px-4" onPress={onPress}>
        <Icon color={color} size={24} />
        <Text className="ml-2 font-medium" style={{ color }}>{label}</Text>
      </Button>
    </View>
  </Animated.View>
);

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

  // View Mode: controls hidden unless long-press reveals them. Edit Mode: always visible.
  const showTopControls = isEditMode || showSecondaryControls;

  return (
    <View
      className="absolute"
      style={{ top: insets.top, bottom: insets.bottom, left: insets.left, right: insets.right }}
      pointerEvents="box-none"
    >
      {showTopControls && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="absolute top-2 left-5 right-5 flex-row justify-between items-center"
          pointerEvents="box-none"
        >
          <Panel icon={ChevronLeft} label="Volver" onPress={onExit} />

          {isEditMode && (
            <View className={`flex-row ${panel}`} pointerEvents="auto">
              <Button variant="link" className={iconButton} onPress={onUndo} disabled={!canUndo}>
                <Undo2 color={ink.dark} size={24} />
              </Button>
              <View className="w-[1px] h-8 bg-outline-800 self-center" />
              <Button variant="link" className={iconButton} onPress={onRedo} disabled={!canRedo}>
                <Redo2 color={ink.dark} size={24} />
              </Button>
            </View>
          )}

          <View className={panel} pointerEvents="auto">
            <Button onPress={onToggleEditMode} className="h-12 px-4">
              {isEditMode ? <Check color="black" /> : <Pencil color="black" />}
              <Text className="ml-2 font-bold uppercase tracking-wider text-black">{isEditMode ? 'Listo' : 'Editar'}</Text>
            </Button>
          </View>
        </Animated.View>
      )}

      <View className="absolute bottom-4 left-5 right-5 flex-row justify-between items-end" pointerEvents="box-none">
        {!isEditMode && showSecondaryControls && (
          <Panel icon={EyeOff} label="Ocultar" onPress={onHideControls} color={ink.faint} />
        )}
        {isEditMode && <Panel icon={RotateCw} label="Girar 90°" onPress={onRotate90} />}
        {isEditMode && <Panel icon={RotateCcw} label="Reset" onPress={onReset} className="ml-auto" />}
      </View>
    </View>
  );
};
