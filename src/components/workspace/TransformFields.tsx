import React from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, { SharedValue, useAnimatedProps, useDerivedValue } from 'react-native-reanimated';
import { TransformState } from '@/types/project';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Live readout on the UI thread. A typed value commits on blur. Spanish keyboards type a decimal comma.
const NumField = ({ label, value, digits, onCommit }:
  { label: string; value: SharedValue<number>; digits: number; onCommit: (n: number) => void }) => {
  const animatedProps = useAnimatedProps(() => ({ text: value.value.toFixed(digits) }) as any);
  return (
    <View className="items-center px-1">
      <Text className="text-[10px] uppercase tracking-widest text-typography-500">{label}</Text>
      <AnimatedTextInput
        defaultValue={value.value.toFixed(digits)}
        animatedProps={animatedProps}
        keyboardType="numeric"
        selectTextOnFocus
        disableFullscreenUI
        className="w-20 text-center text-base font-bold text-typography-0 p-0"
        onEndEditing={(e) => {
          const n = parseFloat(e.nativeEvent.text.replace(',', '.'));
          if (Number.isFinite(n)) onCommit(n);
        }}
      />
    </View>
  );
};

interface TransformFieldsProps {
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  scale: SharedValue<number>;
  rotation: SharedValue<number>;
  baseRotation: number;
  onSet: (patch: Partial<TransformState>) => void;
}

// Shows the full angle (gesture + 90° steps) in [-180, 180) and the zoom in percent.
export const TransformFields: React.FC<TransformFieldsProps> = ({ translationX, translationY, scale, rotation, baseRotation, onSet }) => {
  const angle = useDerivedValue(() => {
    const deg = (rotation.value * 180) / Math.PI + baseRotation;
    return ((((deg + 180) % 360) + 360) % 360) - 180;
  });
  const zoom = useDerivedValue(() => scale.value * 100);

  return (
    <View className="flex-row justify-center">
      <View className="flex-row bg-background-950 border border-outline-800 p-1" pointerEvents="auto">
        <NumField label="X" value={translationX} digits={0} onCommit={(n) => onSet({ translationX: n })} />
        <NumField label="Y" value={translationY} digits={0} onCommit={(n) => onSet({ translationY: n })} />
        <NumField label="Zoom %" value={zoom} digits={1} onCommit={(n) => n > 0 && onSet({ scale: n / 100 })} />
        <NumField label="Ángulo °" value={angle} digits={2} onCommit={(n) => onSet({ rotation: ((n - baseRotation) * Math.PI) / 180 })} />
      </View>
    </View>
  );
};
