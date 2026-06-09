import ButtonComponent from "@/components/ui/Button";
import ButtonChat from "@/components/ui/ButtonChat";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { StatusCadastro } from "@/utils";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FaceCaptureWebView from "../face/components/FaceCaptureWebView";
import PulsingImageLoader from "../register/components/PulsingImageLoader";
import { useRegisterQuery } from "../register/query/useRegisterQuerys";
import ExpiredDocument from "./components/ExpiredDocument";
import HeaderDivergente from "./components/HeaderDivergente";
import ItemDivergente from "./components/ItemDivergente";
import SendDocument, { Selected } from "./components/SendDocument";
import Openfinance from "./Openfinance";
import OtpDivergencia from "./otp";
import PalencaDivergente from "./Palenca";
import { uploadDocumentService } from "./service/upload";
import { getInitialSelectedForItem, safeParseArray } from "./utils/parse";

export default function DivergenciaScreenn() {
  const { AlertDisplay, showError, showSuccess, showWarning } = useAlerts();
  const { mutateAsync, isPending } = useRegisterQuery();
  const { data } = useRegisterStore();
  const isPrimeiraAnalise = Number(data?.primeira_analise) === 1;
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, { key: string; selected?: Selected }>
  >({});
  const [item, setItem] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isOtpSend, setIsOtpSend] = useState<boolean>(false);

  const divergencias = useMemo(
    () =>
      safeParseArray(data?.divergencias || "[]")
        .map((value: any) => {
          if (typeof value === "string") return value;
          if (typeof value?.key === "string") return value.key;
          if (typeof value?.item === "string") return value.item;
          return "";
        })
        .filter((value: string) => Boolean(value)),
    [data?.divergencias],
  );

  const isOnlyFaceDivergence =
    divergencias.length === 1 && divergencias[0] === "face";
  const hasPendingDocuments = useMemo(() => {
    return divergencias.some(
      (documentKey: string) =>
        !getInitialSelectedForItem(documentKey, selectedFiles),
    );
  }, [divergencias, selectedFiles]);
  const hasFrontDocument = Boolean(selectedFiles.foto_frente_doc?.selected);
  const hasBackDocument = Boolean(selectedFiles.foto_verso_doc?.selected);
  const canOpenFaceRecognition = hasFrontDocument && hasBackDocument;
  const canSelectFaceRecognition =
    isOnlyFaceDivergence || canOpenFaceRecognition;

  const uploadDocument = async (selected: Selected | null) => {
    setLoading(true);

    try {
      const url = await uploadDocumentService(selected as Selected);
      await mutateAsync({
        request: {
          [item]: url,
        },
      });
      setSelectedFiles((prev) => ({
        ...prev,
        [item]: { key: url, selected: selected! },
      }));
      setItem("");
    } catch (error: any) {
      if (error?.response?.status === 401) return;
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedFile = (documentKey: string) => {
    setSelectedFiles((prev) => {
      if (!prev[documentKey]) return prev;

      const next = { ...prev };
      delete next[documentKey];
      return next;
    });
  };

  const onSubmit = async () => {
    if (divergencias.length === 0) {
      showWarning("Atenção", "Nenhum documento divergente foi encontrado.");
      return;
    }

    if (hasPendingDocuments) {
      showWarning(
        "Atenção",
        "Envie todos os documentos divergentes antes de continuar.",
      );
      return;
    }
    setLoading(true);
    try {
      await api.post("/v1/analise/otp");
      setIsOtpSend(true);
    } catch (error) {
      return;
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (nextItem: any) => {
    const item =
      typeof nextItem === "string" ? nextItem : String(nextItem ?? "");

    if (item === "face" && !canSelectFaceRecognition) {
      showWarning(
        "Atenção",
        "Envie a foto da frente e do verso do documento antes do reconhecimento facial.",
      );
      return;
    }

    setItem(item);
  };

  if (loading || isPending) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text={hasPendingDocuments ? "Enviando arquivo...." : "Finalizando..."}
      />
    );
  }

  if (data?.status === StatusCadastro.PROPOSTA_EXPIRADO) {
    return <ExpiredDocument />;
  }

  if (isOtpSend) {
    return <OtpDivergencia back={() => setIsOtpSend(false)} />;
  }

  if (item && item !== "face" && item !== "openfinance") {
    return (
      <>
        <SendDocument
          item={item}
          initialSelected={getInitialSelectedForItem(item, selectedFiles)}
          back={(currentSelected) => {
            if (!currentSelected) {
              clearSelectedFile(item);
            }
            setItem("");
          }}
          onSubmit={uploadDocument}
        />
      </>
    );
  }

  if (item && item === "face") {
    return (
      <FaceCaptureWebView
        visible
        onSuccess={(payload: any) => {
          setItem("");
          // const faceSelected = extractFaceSelected(payload);
          if (!payload) {
            showError(
              "Erro",
              "Não foi possível obter a captura. Tente novamente.",
            );
            return;
          }
          uploadDocument(payload.file);
        }}
        onClose={() => setItem("")}
      />
    );
  }

  if (item && item === "palenca") {
    return (
      <>
        <PalencaDivergente />
      </>
    );
  }

  if (item && item === "openfinance") {
    return (
      <>
        <Openfinance
          back={() => setItem("")}
          onConnected={() => {
            setSelectedFiles((prev) => ({
              ...prev,
              openfinance: { key: "connected" },
            }));
            showSuccess("Sucesso", "Open Finance conectado com sucesso.");
          }}
        />
      </>
    );
  }

  const renderDocumentRequests = () => {
    return divergencias.map((documentKey: string, index: number) => {
      const initialSelected = getInitialSelectedForItem(
        documentKey,
        selectedFiles,
      );

      return (
        <ItemDivergente
          key={index}
          item={documentKey}
          selectedUri={initialSelected?.uri}
          onSelect={onSelect}
          disabled={documentKey === "face" && !canSelectFaceRecognition}
          disabledLabel="Enviar docs"
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AlertDisplay />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isPrimeiraAnalise && (
          <>
            <Text style={styles.title}>Documentos Divergentes</Text>
            <Text style={styles.subtitle}>
              Alguns documentos precisam ser reenviados para concluir a
              validação. Verifique os itens abaixo e envie novamente.
            </Text>

            <View>
              <Text style={styles.observacoesTitle}>Observações</Text>
              <Text style={styles.observacoesText}>{data?.observacoes}</Text>
            </View>
          </>
        )}

        {isPrimeiraAnalise && <HeaderDivergente />}

        <View style={styles.itemsContainer}>{renderDocumentRequests()}</View>

        <View style={styles.footer}>
          <ButtonComponent
            title={isPrimeiraAnalise ? "Concluir cadastro" : "Enviar novamente"}
            onPress={() => onSubmit()}
            iconLeft={null}
            iconRight={null}
            disabled={loading || hasPendingDocuments}
          />
        </View>
      </ScrollView>
      <ButtonChat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  observacoesContainer: {
    marginVertical: 14,
  },
  observacoesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
  },
  observacoesText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginVertical: 12,
  },
  itemsContainer: {
    marginVertical: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,

    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
});
