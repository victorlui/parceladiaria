import { View, Text, Alert } from 'react-native';
import { OTPInput, type SlotProps, type OTPInputRef } from 'input-otp-native';

import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils';

type Props = {
    sendCode: (code:string) => void

}

export default function AppleOTPInput({sendCode}:Props) {
  const ref = useRef<OTPInputRef>(null);

  const onComplete = (code: string) => {
    sendCode(code)
    ref.current?.clear();
  };

  return (
    <OTPInput
      ref={ref}
      onComplete={onComplete}
      maxLength={6}
      render={({ slots }) => (
        <View className="flex-row gap-2 items-center justify-center my-4">
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} />
          ))}
        </View>
      )}
    />
  );
}

function Slot({ char, isActive, hasFakeCaret }: SlotProps) {
  return (
    <View
      className={cn(
        'w-[50px] h-[50px] items-center justify-center border rounded-lg bg-white',
        isActive ? 'border-black border-2' : 'border-gray-200'
      )}
    >
      {char !== null && (
        <Text className="text-2xl font-medium text-gray-900">{char}</Text>
      )}
      {hasFakeCaret && <FakeCaret />}
    </View>
  );
}

function FakeCaret() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle = {
    width: 2,
    height: 28,
    backgroundColor: '#000',
    borderRadius: 1,
  };

  return (
    <View className="absolute w-full h-full items-center justify-center">
      <Animated.View style={[baseStyle, animatedStyle]} />
    </View>
  );
}
