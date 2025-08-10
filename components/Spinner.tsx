import { Colors } from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";
// import LottieView from 'lottie-react-native';
// import { useRef } from "react";

export default function Spinner() {
    //const animation = useRef<LottieView>(null);
    return (
        <View className="z-10 absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-black/50">
            <ActivityIndicator color={Colors.primaryColor} size={40} />
        </View>
    )
}