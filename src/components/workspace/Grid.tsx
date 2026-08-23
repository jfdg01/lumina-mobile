import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

const STEP = 50; // cell size in dp at zoom 100%. Divides the 300 dp image box, so the image edges sit on lines.
const HALF = STEP / 2;
const LINE = 'rgba(255,255,255,0.3)';

// Level grid, fixed to the screen: the projector's own frame. The image moves and turns against it.
// The cell grows with the zoom. Lines at the cell midpoints fade in as the cell grows; at 2× they become the cells,
// so the split shows no jump.
export const Grid: React.FC<{ scale: SharedValue<number> }> = ({ scale }) => {
  const [box, setBox] = useState({ width: 0, height: 0 });
  // Even cell count: the centre of the square is a full line. Covers the screen at any zoom.
  const cells = 2 * Math.ceil((Math.max(box.width, box.height) / STEP + 2) / 2);
  const size = cells * STEP;

  // Zoom factor folded into [1, 2)
  const level = useDerivedValue(() => {
    const s = Math.max(scale.value, 1e-6);
    return s / Math.pow(2, Math.floor(Math.log2(s)));
  });

  const square = useAnimatedStyle(() => ({ transform: [{ scale: level.value }] }));
  // Counter the scale, so a line stays 1 dp on screen
  const vertical = useAnimatedStyle(() => ({ width: 1 / level.value }));
  const horizontal = useAnimatedStyle(() => ({ height: 1 / level.value }));
  const midpoint = useAnimatedStyle(() => ({ opacity: level.value - 1 }));

  // One vertical and one horizontal line per offset
  const lines = (offsets: number[]) =>
    offsets.map((o) => (
      <React.Fragment key={o}>
        <Animated.View style={[{ position: 'absolute', left: o, top: 0, bottom: 0, backgroundColor: LINE }, vertical]} />
        <Animated.View style={[{ position: 'absolute', top: o, left: 0, right: 0, backgroundColor: LINE }, horizontal]} />
      </React.Fragment>
    ));
  const all = Array.from({ length: cells * 2 + 1 }, (_, i) => i * HALF);

  return (
    <View className="absolute inset-0" pointerEvents="none" onLayout={(e) => setBox(e.nativeEvent.layout)}>
      <Animated.View
        style={[{ position: 'absolute', width: size, height: size, left: (box.width - size) / 2, top: (box.height - size) / 2 }, square]}
      >
        {lines(all.filter((_, i) => i % 2 === 0))}
        <Animated.View style={[StyleSheet.absoluteFill, midpoint]}>{lines(all.filter((_, i) => i % 2 === 1))}</Animated.View>
      </Animated.View>
    </View>
  );
};
