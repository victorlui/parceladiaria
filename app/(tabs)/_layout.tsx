import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/auth";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FloatingPayButton = ({ disabled, ...props }: any) => {
  const focused = props?.accessibilityState?.selected;

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.9}
      disabled={disabled}
      style={[
        props.style,
        { top: -22, alignItems: "center", opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: focused
            ? Colors.green.primary
            : Colors.green.primary,
          borderWidth: 4,
          borderColor: "#fff",
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesome6 name="pix" size={24} color="#fff" />
      </View>

      <Text
        style={{
          marginTop: 6,
          fontSize: 12,
          fontWeight: "500",
          color: focused ? Colors.green.primary : "#777",
        }}
      >
        Pagar
      </Text>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.green.primary,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            // altura base + espaço seguro inferior (evita sobrepor à barra do Android)
            height: 64 + insets.bottom,
            // padding inferior igual ao safe area para manter tudo visível
            paddingBottom: Math.max(insets.bottom, 12),
            // pequeno padding superior para dar respiro aos ícones
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Início",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name="home" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="loans"
          options={{
            title: "Empréstimos",
            tabBarIcon: ({ color }) => (
              <FontAwesome6
                name="file-invoice-dollar"
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="payments"
          options={{
            title: "Pagar",
            tabBarLabel: "", // rótulo padrão oculto (usamos o Text customizado)
            tabBarButton: (props) => (
              <FloatingPayButton
                {...props}
                {...{ disabled: user?.lastLoan?.blocked }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name="user" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="config"
          options={{
            title: "Config",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name="cog" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="renew"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="renew_list"
          options={{
            href: null,
          }}
        />
      </Tabs>
      {/* <ButtonChat botton={110} /> */}
    </>
  );
}
