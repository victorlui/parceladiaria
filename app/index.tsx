import { useEffect } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/auth";
import { StatusCadastro } from "@/utils";

export default function Index() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setTimeout(() => {
          if (!token && !user) {
            router.replace("/login");
            return;
          }

          if (user?.type === "client") {
            if (!user.status) {
              router.replace("/(app)/home");
              return;
            }

            switch (user.status) {
              case StatusCadastro.ANALISE:
                router.replace("/analise_screen");
                break;
              case StatusCadastro.RECUSADO:
                router.replace("/recusado_screen");
                break;
              case StatusCadastro.DIVERGENTE:
                router.replace("/divergencia_screen");
                break;
              case StatusCadastro.REANALISE:
                router.replace("/reanalise_screen");
                break;
              case StatusCadastro.PRE_APROVADO:
                router.replace("/pre_aprovado_screen");
                break;
              case StatusCadastro.APROVADO:
                router.replace("/(app)/home");
                break;

              default:
                router.replace("/login");
                break;
            }
            return;
          }

          router.replace("/login");
        }, 100);
      } catch (error) {
        console.error("Erro na inicialização:", error);
        router.replace("/login");
      }
    };

    initializeApp();
  }, [router, token, user]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <StatusBar style="dark" />
      <ActivityIndicator size="large" color="#9BD13D" />
    </View>
  );
}
