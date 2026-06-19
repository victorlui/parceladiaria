import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { api } from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { StatusCadastro } from "@/utils";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FaceCaptureWebView from "../face/components/FaceCaptureWebView";
import PulsingImageLoader from "../register/components/PulsingImageLoader";
import { useRegisterQuery } from "../register/query/useRegisterQuerys";
import ExpiredDocument from "./components/ExpiredDocument";
import HeaderDivergente from "./components/HeaderDivergente";
import ItemDivergente from "./components/ItemDivergente";
import Loading from "./components/Loading";
import SendDocument from "./components/SendDocument";
import Openfinance from "./Openfinance";
import OtpDivergencia from "./otp";
import PalencaDivergente from "./Palenca";
import { uploadDocumentService } from "./service/upload";
import {
  getInitialSelectedForItem,
  safeParseArray,
  SelectedFileMap,
} from "./utils/parse";

export default function DivergenciaScreenn() {
  const { AlertDisplay } = useAlerts();
  const { data } = useRegisterStore();
  const { mutateAsync } = useRegisterQuery();
  const isPrimeiraAnalise = Number(data?.primeira_analise) === 1;
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileMap>({});
  const [item, setItem] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<any>(null);
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

  const hasPendingDocuments = useMemo(() => {
    return divergencias.some(
      (documentKey: string) =>
        !getInitialSelectedForItem(documentKey, selectedFiles),
    );
  }, [divergencias, selectedFiles]);

  const onSelect = (nextItem: any) => {
    const itemKey =
      typeof nextItem === "string" ? nextItem : String(nextItem ?? "");

    setItem(itemKey);
  };

  const uploadFace = async (file: any) => {
    setLoading(true);
    setUploadProgress(null);
    try {
      // 1) Upload do arquivo pro S3 (com progresso real).
      const url = await uploadDocumentService(file, (fraction) => {
        setUploadProgress({ fraction });
      });

      // Se o upload abortou (ex.: arquivo > 10MB) o service já alertou.
      if (!url) return;

      setUploadProgress({ fraction: 1 });

      await mutateAsync({
        request: {
          [item]: url,
        },
      });

      setSelectedFiles((prev) => ({ ...prev, [item]: url }));
      setItem("");
    } catch (error: any) {
      console.log("error upload face", error?.response ?? error);
      // Erros do upload: alert já vem do próprio service.
      // Erros do mutateAsync: alert já vem do `onError` do useRegisterQuery.
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const onSubmit = async () => {
    setLoadingSubmit(true);
    try {
      await api.post("/v1/analise/otp");
      setIsOtpSend(true);
    } catch (error) {
      return;
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (data?.status === StatusCadastro.PROPOSTA_EXPIRADO) {
    return <ExpiredDocument />;
  }

  if (isOtpSend) {
    return <OtpDivergencia back={() => setIsOtpSend(false)} />;
  }

  if (loading) {
    return <Loading uploadProgress={uploadProgress} />;
  }

  if (loadingSubmit) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text="Aguarde, completando..."
      />
    );
  }

  if (item && (item === "face" || item === "facial")) {
    return (
      <FaceCaptureWebView
        visible
        onSuccess={(payload: any) => {
          uploadFace(payload.file);
        }}
        onClose={() => setItem("")}
      />
    );
  }

  if (item && item === "palenca") {
    return <PalencaDivergente onComplete={onSubmit} />;
  }

  if (item && item === "openfinance") {
    return (
      <Openfinance
        back={() => setItem("")}
        onConnected={() => {
          onSubmit();
        }}
      />
    );
  }

  if (
    item &&
    item !== "face" &&
    item !== "openfinance" &&
    item !== "facial" &&
    item !== "palenca"
  ) {
    return (
      <>
        <SendDocument
          item={item}
          initialSelected={getInitialSelectedForItem(item, selectedFiles)}
          back={(currentSelected) => {
            setSelectedFiles((prev) => ({ ...prev, ...currentSelected }));
            setItem("");
          }}
          close={() => setItem("")}
          uploading={loading}
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
        <HeaderDivergente isPrimeiraAnalise={isPrimeiraAnalise} data={data} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 80 : 80,
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
