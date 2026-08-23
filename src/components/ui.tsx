import { Pressable, PressableProps, Text, View } from 'react-native';

// ponytail: three looks cover every button in the app. Add a key here, not a kit.
const looks = {
  solid: 'bg-primary-500 active:bg-primary-600',
  outline: 'border-2 border-outline-300 active:bg-background-50',
  link: 'active:bg-background-800',
};

type ButtonProps = PressableProps & { variant?: keyof typeof looks; className?: string };

export function Button({ variant = 'solid', className = '', disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      className={`flex-row items-center justify-center ${looks[variant]} ${disabled ? 'opacity-40' : ''} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}

export function Header({ title, className = '' }: { title: string; className?: string }) {
  return (
    <View className={`p-6 pt-12 border-b border-outline-100 bg-background-0 ${className}`}>
      <Text className="text-4xl text-typography-900 font-black tracking-tighter uppercase">{title}</Text>
    </View>
  );
}

// Icon colours. Lucide takes a hex `color` prop, not a class. Values copy tailwind.config.js.
export const ink = {
  dark: '#171717', // typography-0
  muted: '#a3a3a3', // typography-400
  faint: '#8c8c8c', // typography-500
  ok: '#66b584', // success-600
  bad: '#f96160', // error-600
};
