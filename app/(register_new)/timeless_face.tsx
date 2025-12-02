import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";
import LayoutRegister from "@/components/ui/LayoutRegister";
import CircleIcon from "@/components/ui/CircleIcon";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import ButtonComponent from "@/components/ui/Button";

const TipItem: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <View style={styles.tipRow}>
    <LinearGradient
      style={styles.tipIcon}
      colors={[Colors.green.primary, "#28a999"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {icon}
    </LinearGradient>
    <Text style={styles.tipText}>{label}</Text>
  </View>
);

const TimelessFace: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarOuter}>
          <LinearGradient
            style={styles.avatarInner}
            colors={[Colors.green.primary, "#28a999"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person" size={32} color="#fff" />
          </LinearGradient>
        </View>
      </View>
      <View>
        <Text style={styles.title}>Vamos tirar sua foto</Text>
        <Text style={styles.subtitle}>
          Siga as instruções para garantir uma foto perfeita
        </Text>
      </View>
      <View style={styles.card}>
        <TipItem
          icon={<Ionicons name="bulb-outline" size={20} color="#fff" />}
          label="Ambiente bem iluminado"
        />
        <TipItem
          icon={<FontAwesome5 name="glasses" size={18} color="#fff" />}
          label="Retire óculos e acessórios"
        />
        <TipItem
          icon={<Ionicons name="happy-outline" size={20} color="#fff" />}
          label="Expressão neutra"
        />
        <TipItem
          icon={
            <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
          }
          label="Celular firme e estável"
        />
      </View>
      <ButtonComponent
        title="Fazer Reconhecimento Facial"
        iconLeft="camera"
        iconRight={null}
        onPress={() => {}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "space-evenly",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 1,
  },
  avatarOuter: {
    width: 120,
    height: 120,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BEE4DF",
    padding: 6,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.gray.primary,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
    padding: 8,
    borderRadius: 50,
  },
  tipText: {
    fontSize: 14,
  },
});

export default TimelessFace;
