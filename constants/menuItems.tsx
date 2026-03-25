import { Linking, Alert } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

export type Item = {
  key: string;
  title: string;
  icon: React.ReactNode;
  available: boolean;
  disabled: boolean;
  onPress: () => void | Promise<void>;
};

type Props = {
  user: any;
  router: any;
};

export function getMenuItems({ user, router }: Props): Item[] {
  return [
    {
      key: "renew",
      title: "Renovar Empréstimo",
      icon: <FontAwesome name="refresh" size={24} color="#fff" />,
      available: true,
      disabled: user?.lastLoan?.blocked ?? false,
      onPress: () => {
        router.push("/(tabs)/renew");
      },
    },
    {
      key: "whatsapp",
      title: "Suporte WhatsApp",
      icon: <FontAwesome name="whatsapp" size={28} color="#fff" />,
      available: false,
      disabled: false,
      onPress: async () => {
        const phoneNumber = "5511952133321";
        const message = "Olá! Poderia me ajudar?";

        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Erro", "WhatsApp não está instalado.");
        }
      },
    },
    {
      key: "news",
      title: "Novidades",
      icon: <Ionicons name="megaphone-outline" size={28} color="#fff" />,
      available: false,
      disabled: false,
      onPress: () => {},
    },
    {
      key: "instagram",
      title: "Instagram",
      icon: <Ionicons name="logo-instagram" size={28} color="#fff" />,
      available: false,
      disabled: false,
      onPress: async () => {
        const url = "https://www.instagram.com/parceladiaria";

        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Erro", "Não foi possível abrir o Instagram.");
        }
      },
    },
  ];
}
