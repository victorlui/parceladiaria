import { Linking, Alert } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

export type Item = {
  key: string;
  title: string;
  icon: React.ReactNode;
  badge: boolean;
  titleBadge: string;
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
      badge: false,
      titleBadge: "",
      disabled: user?.lastLoan?.blocked ?? false,
      onPress: () => {
        router.push("/(tabs)/renew");
      },
    },
    {
      key: "whatsapp",
      title: "Suporte WhatsApp",
      icon: <FontAwesome name="whatsapp" size={28} color="#fff" />,
      badge: false,
      titleBadge: "",
      disabled: false,
      onPress: async () => {
        const url = `https://parceladiaria.com.br/campanha/76`;

        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Erro", "WhatsApp não está instalado.");
        }
      },
    },
    {
      key: "indications",
      title: "Indicações",
      icon: <Ionicons name="people-outline" size={28} color="white" />,
      badge: false,
      titleBadge: "",
      disabled: false,
      onPress: () => {
        router.push("/(app)/indications");
      },
    },
    {
      key: "instagram",
      title: "Instagram",
      icon: <Ionicons name="logo-instagram" size={28} color="#fff" />,
      badge: false,
      titleBadge: "",
      disabled: false,
      onPress: async () => {
        const url = "https://www.instagram.com/parceladiaria.oficial";

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
