import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { useRegisterAuthStore } from "@/store/register";
import { Etapas } from "@/utils";
import {
  AntDesign,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const AddressScreen: React.FC = () => {
  const { AlertDisplay, showWarning } = useAlerts();
  const { mutate, isPending } = useUpdateUserMutation();
  const { setAddress } = useRegisterAuthStore();
  const cepRef = React.useRef<TextInput>(null);
  const ruaRef = React.useRef<TextInput>(null);
  const numeroRef = React.useRef<TextInput>(null);
  const bairroRef = React.useRef<TextInput>(null);
  const estadoRef = React.useRef<TextInput>(null);
  const cidadeRef = React.useRef<TextInput>(null);
  const [cep, setCep] = React.useState("");
  const [rua, setRua] = React.useState("");
  const [numero, setNumero] = React.useState("");
  const [bairro, setBairro] = React.useState("");
  const [estado, setEstado] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [loadingCep, setLoadingCep] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [cepError, setCepError] = React.useState<string>("");
  const [ruaError, setRuaError] = React.useState<string>("");
  const [numeroError, setNumeroError] = React.useState<string>("");
  const [bairroError, setBairroError] = React.useState<string>("");
  const [estadoError, setEstadoError] = React.useState<string>("");
  const [cidadeError, setCidadeError] = React.useState<string>("");

  const searchCep = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!resp.ok) {
          return;
        }
        const data = await resp.json();
        setRua(data.logradouro);
        setBairro(data.bairro);
        setEstado(data.uf);
        setCidade(data.localidade);
      } catch (e) {
        console.log("ViaCEP erro", e);
      } finally {
        setLoadingCep(false);
        cepRef.current?.blur();
      }
    }
  };

  const validateFields = () => {
    let valid = true;
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setCepError("Informe um CEP válido");
      valid = false;
    }
    if (!rua.trim()) {
      setRuaError("Campo obrigatório");
      valid = false;
    }
    if (!numero.trim()) {
      setNumeroError("Campo obrigatório");
      valid = false;
    }
    if (!bairro.trim()) {
      setBairroError("Campo obrigatório");
      valid = false;
    }
    if (!estado.trim()) {
      setEstadoError("Campo obrigatório");
      valid = false;
    }
    if (!cidade.trim()) {
      setCidadeError("Campo obrigatório");
      valid = false;
    }
    if (!valid) {
      showWarning("Atenção", "Preencha todos os campos obrigatórios.");
    }
    return valid;
  };

  const onSubmit = () => {
    setCepError("");
    setRuaError("");
    setNumeroError("");
    setBairroError("");
    setEstadoError("");
    setCidadeError("");

    if (!validateFields()) {
      return;
    }
    const payload = {
      cep: cep.replace(/\D/g, ""),
      endereco: rua,
      numero,
      bairro,
      cidade,
      estado,
      complemento: "",
      etapa: Etapas.REGISTRANDO_COMPROVANTE_ENDERECO,
    };

    setAddress({
      cep: payload.cep,
      rua: payload.endereco,
      numero: payload.numero,
      bairro: payload.bairro,
      cidade: payload.cidade,
      estado: payload.estado,
      complemento: payload.complemento,
    });

    mutate({ request: payload });
  };

  return (
    <LayoutRegister
      title="Informe seu endereço"
      subtitle="Preencha todos os campos obrigatórios."
      isCenter={false}
    >
      {loadingCep && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.white} size={"large"} />
          <Text style={styles.loadingText}>Buscando endereço...</Text>
        </View>
      )}
      <AlertDisplay />

      <View style={styles.content}>
        <InputComponent
          placeholder="Informe seu CEP"
          keyboardType="number-pad"
          maskType="cep"
          icon={
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={Colors.gray.primary}
            />
          }
          ref={cepRef}
          value={cep}
          onChangeText={(text) => {
            setCep(text);
            if (cepError) setCepError("");
          }}
          returnKeyType="next"
          onSubmitEditing={searchCep}
          error={cepError}
        />
        <InputComponent
          ref={ruaRef}
          placeholder="Informe sua Rua"
          icon={
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={Colors.gray.primary}
            />
          }
          value={rua}
          onChangeText={(text) => {
            setRua(text);
            if (ruaError) setRuaError("");
          }}
          returnKeyType="next"
          onSubmitEditing={() => numeroRef.current?.focus()}
          error={ruaError}
        />
        <InputComponent
          ref={numeroRef}
          placeholder="Informe seu Número"
          icon={
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={Colors.gray.primary}
            />
          }
          value={numero}
          onChangeText={(text) => {
            setNumero(text);
            if (numeroError) setNumeroError("");
          }}
          returnKeyType="next"
          onSubmitEditing={() => bairroRef.current?.focus()}
          error={numeroError}
        />
        <InputComponent
          ref={bairroRef}
          placeholder="Informe seu Bairro"
          icon={
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={Colors.gray.primary}
            />
          }
          value={bairro}
          onChangeText={(text) => {
            setBairro(text);
            if (bairroError) setBairroError("");
          }}
          returnKeyType="next"
          error={bairroError}
          onSubmitEditing={() => estadoRef.current?.focus()}
        />
        <InputComponent
          ref={estadoRef}
          placeholder="Informe seu Estado"
          icon={
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={Colors.gray.primary}
            />
          }
          value={estado}
          onChangeText={(text) => {
            setEstado(text);
            if (estadoError) setEstadoError("");
          }}
          returnKeyType="next"
          onSubmitEditing={() => cidadeRef.current?.focus()}
          error={estadoError}
        />
        <InputComponent
          ref={cidadeRef}
          placeholder="Informe sua Cidade"
          icon={
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={Colors.gray.primary}
            />
          }
          value={cidade}
          onChangeText={(text) => {
            setCidade(text);
            if (cidadeError) setCidadeError("");
          }}
          returnKeyType="done"
          error={cidadeError}
        />

        <ButtonComponent
          title="Próximo"
          onPress={onSubmit}
          loading={isPending}
        />
      </View>
    </LayoutRegister>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(10px)",
    gap: 10,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    gap: 10,
  },
});

export default AddressScreen;
