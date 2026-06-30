import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { api } from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { StatusCadastro } from "@/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, View } from "react-native";
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
  const { AlertDisplay, showError } = useAlerts();
  const { data } = useRegisterStore();
  const { mutateAsync } = useRegisterQuery();
  const isPrimeiraAnalise = Number(data?.primeira_analise) === 1;
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileMap>({});
  const [item, setItem] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<any>(null);
  const [isOtpSend, setIsOtpSend] = useState<boolean>(false);
  const isMountedRef = useRef(true);
  const uploadSignalRef = useRef<{ cancelled: boolean } | null>(null);
  const isUploadingFaceRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (uploadSignalRef.current) {
        uploadSignalRef.current.cancelled = true;
      }
    };
  }, []);

  const normalizeDivergencias = (value: any) => {
    return safeParseArray(value)
      .map((entry: any) => {
        if (typeof entry === "string") return entry;
        if (typeof entry?.key === "string") return entry.key;
        if (typeof entry?.item === "string") return entry.item;
        return "";
      })
      .filter((entry: string) => Boolean(entry));
  };

  const getFaceDocumentKey = (documentKey: string) => {
    return documentKey === "facial" ? "face" : documentKey;
  };

  const divergencias = useMemo(
    () => normalizeDivergencias(data?.divergencias || "[]"),
    [data?.divergencias],
  );

  const hasPendingDocuments = useMemo(() => {
    return divergencias.some(
      (documentKey: string) =>
        !getInitialSelectedForItem(
          getFaceDocumentKey(documentKey),
          selectedFiles,
        ),
    );
  }, [divergencias, selectedFiles]);

  const onSelect = (nextItem: any) => {
    const itemKey =
      typeof nextItem === "string" ? nextItem : String(nextItem ?? "");

    setItem(itemKey);
  };

  const withTimeout = async <T,>(
    promise: Promise<T>,
    timeoutMs: number,
    message: string,
  ): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(message));
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const extractFaceCaptureFile = (payload: any) => {
    const nextFile = payload?.file?.file ?? payload?.file ?? payload;

    if (
      nextFile &&
      typeof nextFile === "object" &&
      typeof nextFile.uri === "string" &&
      nextFile.uri.trim()
    ) {
      return {
        ...nextFile,
        uri: nextFile.uri.trim(),
      };
    }

    return null;
  };

  const uploadFace = async (file: any, documentKey: string) => {
    const normalizedDocumentKey = getFaceDocumentKey(documentKey);

    if (!normalizedDocumentKey || isUploadingFaceRef.current) {
      return;
    }

    isUploadingFaceRef.current = true;
    setLoading(true);
    setUploadProgress(null);
    uploadSignalRef.current = { cancelled: false };
    try {
      // 1) Upload do arquivo pro S3 (com progresso real).
      const url = await withTimeout(
        uploadDocumentService(file, {
          signal: uploadSignalRef.current,
          onProgress: (fraction) => {
            if (!isMountedRef.current) return;
            setUploadProgress({ fraction });
          },
        }),
        90_000,
        "O envio da selfie demorou mais do que o esperado. Tente novamente.",
      );

      // Se o upload abortou (ex.: arquivo > 10MB) o service já alertou.
      if (!url) return;

      if (isMountedRef.current) {
        setUploadProgress({ fraction: 1 });
      }

      await withTimeout(
        mutateAsync({
          request: {
            [normalizedDocumentKey]: url,
          },
          suppressErrorAlert: true,
        }),
        30_000,
        "Nao foi possivel concluir o envio da selfie agora. Tente novamente.",
      );

      if (isMountedRef.current) {
        setSelectedFiles((prev) => ({ ...prev, [normalizedDocumentKey]: url }));
        setItem("");
      }
    } catch (error: any) {
      console.log("error facial", error);
      const errorData = error?.data ?? error?.response?.data;
      const nextDivergencias = normalizeDivergencias(errorData?.divergencias);

      if (error?.status === 422 || error?.response?.status === 422) {
        Alert.alert(
          "Atenção",
          errorData?.message || "Erro ao enviar a selfie",
          [
            {
              text: "OK",
              onPress: () => {
                if (nextDivergencias.length > 0) {
                  const registerStore = useRegisterStore.getState();

                  registerStore.setData({
                    ...(registerStore.data || {}),
                    divergencias: nextDivergencias as any,
                  });

                  if (isMountedRef.current) {
                    setSelectedFiles((prev) => {
                      const nextSelectedFiles = { ...prev };

                      nextDivergencias.forEach((documentKey: string) => {
                        delete nextSelectedFiles[documentKey];
                        delete nextSelectedFiles[
                          getFaceDocumentKey(documentKey)
                        ];
                      });

                      return nextSelectedFiles;
                    });
                  }
                }
              },
            },
          ],
        );
      }

      if (isMountedRef.current) {
        setUploadProgress(null);
        setItem("");
      }

      if (error?.status !== 422 && error?.response?.status !== 422) {
        showError(
          "Erro",
          error?.message ||
            "Nao foi possivel concluir o envio da selfie. Tente novamente.",
        );
      }
    } finally {
      isUploadingFaceRef.current = false;
      uploadSignalRef.current = null;
      if (!isMountedRef.current) return;
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
          const targetItem = getFaceDocumentKey(item);
          const selectedFile = extractFaceCaptureFile(payload);

          setItem("");

          if (!selectedFile) {
            showError(
              "Erro",
              "Nao foi possivel preparar a selfie capturada. Tente novamente.",
            );
            return;
          }

          void uploadFace(selectedFile, targetItem);
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
          initialSelected={getInitialSelectedForItem(
            getFaceDocumentKey(item),
            selectedFiles,
          )}
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
        getFaceDocumentKey(documentKey),
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
