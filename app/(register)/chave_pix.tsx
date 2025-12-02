import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { Etapas } from "@/utils";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { useAuthStore } from "@/store/auth";
import { useRegisterAuthStore } from "@/store/register";
import { validateCPF, validatePhone, validateEmail } from "@/utils/validation";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const options = [
  {
    label: "CPF",
    value: "cpf",
  },
  {
    label: "Telefone",
    value: "phone",
  },
  {
    label: "E-mail",
    value: "email",
  },
];

const ChavePix: React.FC = () => {
  const {
    cpf,
    email: emailRegister,
    phone: phoneRegister,
  } = useRegisterAuthStore();
  const cpfRef = useRef<TextInput>(null);
  const { userRegister } = useAuthStore();
  const { mutate, isPending } = useUpdateUserMutation();
  const [selected, setSelected] = React.useState<string>("");
  const [keyPix, setKeyPix] = React.useState<string>("");
  React.useEffect(() => {
    if (!selected) return;
    if (selected === "cpf") {
      setKeyPix(cpf || userRegister?.cpf || "");
    } else if (selected === "phone") {
      setKeyPix(phoneRegister || userRegister?.phone || "");
    } else if (selected === "email") {
      setKeyPix(emailRegister || userRegister?.email || "");
    }
    setConfirmed(false);
    setKeyPixTouched(false);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  const [keyPixTouched, setKeyPixTouched] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const handleNext = () => {
    setKeyPixTouched(true);
    const error =
      selected === "phone"
        ? validatePhone(keyPix)
        : selected === "cpf"
          ? validateCPF(keyPix)
          : selected === "email"
            ? validateEmail(keyPix)
            : "Selecione um tipo de chave";
    if (error) return;
    setConfirmed(true);
  };

  const handleSubmit = () => {
    const request = {
      chave: selected,
      pix:
        selected === "cpf"
          ? cpf
            ? cpf
            : userRegister?.cpf
          : selected === "email"
            ? keyPix
            : `+55${keyPix?.replace(/\D/g, "")}`,
      etapa: Etapas.REGISTRANDO_ENDERECO,
    };

    mutate({ request: request });
  };

  const handleEdit = () => {
    setConfirmed(false);
    setKeyPixTouched(false);
  };

  const handleBack = () => {
    setSelected("");
    setKeyPix("");
    setKeyPixTouched(false);
  };

  const returnIcon = (value: string) => {
    return (
      <FontAwesome
        name={
          value === "cpf" ? "id-card" : value === "email" ? "envelope" : "phone"
        }
        size={30}
        color={Colors.green.primary}
      />
    );
  };

  const returnText = (value: string) => {
    if (value === "cpf") {
      return "usar meu CPF";
    }
    if (value === "email") {
      return "Seu e-mail";
    }
    if (value === "phone") {
      return "Seu telefone";
    }
  };

  const errorMessage = React.useMemo(() => {
    if (!selected) return "";
    if (selected === "phone") return validatePhone(keyPix);
    if (selected === "cpf") return validateCPF(keyPix);
    if (selected === "email") return validateEmail(keyPix);
    return "";
  }, [selected, keyPix]);

  return (
    <LayoutRegister
      title={
        selected && confirmed ? "Confirme sua chave PIX" : "Qual sua chave PIX?"
      }
      subtitle={
        selected && confirmed
          ? "O valor será enviado para esta chave. Está correto?"
          : "vamos usar esta chave para enviar o valor do seu empréstimo."
      }
    >
      {!selected && (
        <>
          <LinearGradient
            colors={["#fff9e6", "#fff0b3", "#ffecb3"]}
            start={[0, 1]}
            end={[1, 0]}
            style={styles.warning}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <FontAwesome5
                name="exclamation-triangle"
                size={14}
                color="#D97706"
              />
              <Text style={styles.alertaTexto}>
                Atenção: A chave PIX não pode estar vinculada a um CNPJ
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <FontAwesome5
                name="exclamation-triangle"
                size={14}
                color="#D97706"
              />
              <Text style={styles.alertaTexto}>
                Use apenas chaves PIX de pessoas físicas (CPF)
              </Text>
            </View>
          </LinearGradient>
          {options.map((item) => (
            <TouchableOpacity
              onPress={() => setSelected(item.value)}
              style={styles.item}
              key={item.value}
            >
              {returnIcon(item.value)}
              <Text style={styles.title}>{item.label}</Text>
              <Text style={styles.subtitle}>{returnText(item.value)}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {selected && confirmed && (
        <>
          <View style={styles.selectedItem}>
            <Text style={styles.selectedText}>
              Tipo de Chave:{" "}
              <Text style={styles.selectedValues}>
                {selected.toUpperCase()}
              </Text>
            </Text>
            <Text style={styles.selectedText}>
              Chave: <Text style={styles.selectedValues}>{keyPix}</Text>
            </Text>
          </View>
          <ButtonComponent
            title="Sim, está correto"
            onPress={handleSubmit}
            loading={isPending}
            iconRight={null}
            iconLeft="checkmark-sharp"
          />
          <ButtonComponent
            title="Não, Corrigir"
            onPress={handleEdit}
            iconRight={null}
            iconLeft="close"
            outline={true}
          />
        </>
      )}

      {selected && !confirmed && selected === "phone" && (
        <>
          <InputComponent
            ref={cpfRef}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maskType="cellphone"
            icon={
              <Ionicons
                name="call-sharp"
                size={20}
                color={Colors.gray.primary}
              />
            }
            value={keyPix}
            onChangeText={setKeyPix}
            returnKeyType="next"
            onBlur={() => setKeyPixTouched(true)}
            error={keyPixTouched ? errorMessage : undefined}
          />
          <ButtonComponent
            title="Confirmar"
            onPress={handleNext}
            loading={isPending}
            iconRight={null}
            iconLeft="checkmark-sharp"
          />
          <ButtonComponent
            title="Voltar"
            onPress={handleBack}
            iconRight={null}
            iconLeft="close"
            outline={true}
          />
        </>
      )}
      {selected && !confirmed && selected === "email" && (
        <>
          <InputComponent
            ref={cpfRef}
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            icon={
              <Ionicons
                name="mail-sharp"
                size={20}
                color={Colors.gray.primary}
              />
            }
            value={keyPix}
            onChangeText={setKeyPix}
            returnKeyType="done"
            autoCapitalize="none"
            onBlur={() => setKeyPixTouched(true)}
            error={keyPixTouched ? errorMessage : undefined}
          />
          <ButtonComponent
            title="Confirmar"
            onPress={handleNext}
            loading={isPending}
            iconRight={null}
            iconLeft="checkmark-sharp"
          />
          <ButtonComponent
            title="Voltar"
            onPress={handleBack}
            iconRight={null}
            iconLeft="close"
            outline={true}
          />
        </>
      )}

      {selected && !confirmed && selected === "cpf" && (
        <>
          <InputComponent
            ref={cpfRef}
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            maskType="cpf"
            icon={
              <FontAwesome
                name="id-card"
                size={20}
                color={Colors.gray.primary}
              />
            }
            value={keyPix}
            onChangeText={setKeyPix}
            returnKeyType="done"
            onBlur={() => setKeyPixTouched(true)}
            error={keyPixTouched ? errorMessage : undefined}
          />
          <ButtonComponent
            title="Confirmar"
            onPress={handleNext}
            loading={isPending}
            iconRight={null}
            iconLeft="checkmark-sharp"
          />
          <ButtonComponent
            title="Voltar"
            onPress={handleBack}
            iconRight={null}
            iconLeft="close"
            outline={true}
          />
        </>
      )}
    </LayoutRegister>
  );
};

const styles = StyleSheet.create({
  warning: {
    flexDirection: "column",
    gap: 10,
    paddingHorizontal: 13,
    backgroundColor: "#fff9e6",
    borderLeftWidth: 5,
    borderColor: "#D97706",
    borderRadius: 12,
    marginVertical: 10,
    paddingVertical: 15,
  },
  alertaTexto: {
    fontFamily: "System",
    color: "#5d4037",
    fontSize: 13,
    fontWeight: "500",
  },
  item: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 18,
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
  selectedItem: {
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    borderStyle: "dashed",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 25,
    gap: 8,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.green.text,
    textAlign: "center",
  },
  selectedValues: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.black,
    textAlign: "center",
  },
});

export default ChavePix;
