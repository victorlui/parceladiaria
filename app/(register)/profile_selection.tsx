import Spinner from "@/components/Spinner";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const options = [
  {
    id: "motorista_carro",
    label: "Motorista",
    profissaoValue: "Uber, 99, etc",
    iconName: "car",
  },
  {
    id: "motorista_moto",
    label: "Motoboy",
    profissaoValue: "Entregador, motoboy, etc.",
    iconName: "motorcycle",
  },
  {
    id: "comerciante",
    label: "Comerciante",
    profissaoValue: "Loja, comércio, etc.",
    iconName: "store",
  },
];

const ProfileSelection: React.FC = () => {
  const { mutate, isPending } = useUpdateUserMutation();

  const onContinue = (item: any) => {
    let etapa =
      item.id === "comerciante"
        ? Etapas.COMERCIANTE_ENVIANDO_TIPO_COMERCIO
        : Etapas.MOTORISTA_REGISTRANDO_FRENTE_CNH;

    const request = {
      etapa,
      profissao: item.label,
    };

    mutate({ request });
  };
  return (
    <LayoutRegister
      title="Qual seu ramo de atividade?"
      subtitle="Isso nos ajuda a personalizar seu cadastro"
    >
      {isPending && <Spinner />}
      {options.map((item) => (
        <TouchableOpacity
          onPress={() => onContinue(item)}
          key={item.id}
          style={styles.item}
        >
          <FontAwesome6
            name={item.iconName as "car" | "motorbike" | "store"}
            size={32}
            color={Colors.green.primary}
          />
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.subtitle}>{item.profissaoValue}</Text>
        </TouchableOpacity>
      ))}
    </LayoutRegister>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.primary,
  },
});

export default ProfileSelection;
