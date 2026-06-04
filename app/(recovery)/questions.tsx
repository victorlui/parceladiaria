import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { QuestionsPayload, useQuestionsStore } from "@/store/questions";
import { useRegisterStore } from "@/store/register_new";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionsScreen() {
  const { showWarning, showInfo } = useAlerts();
  const {
    data: questions,
    setData,
    clearData,
  } = useQuestionsStore((state) => state);
  const { cpfValid, setCpfValid } = useAuthStore((state) => state);
  const {
    data: registerData,
    setData: setRegisterData,
    setToken,
  } = useRegisterStore((state) => state);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const progress = useMemo(() => {
    if (!questions?.total || !questions?.index) return 0;
    return Math.min((questions.index / questions.total) * 100, 100);
  }, [questions?.index, questions?.total]);

  const resetRecoveryFlow = () => {
    clearData();
    setCpfValid(null);
    setSelectedOption(null);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      showWarning("Atenção", "Selecione uma resposta para continuar.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/recovery/answer", {
        answer: selectedOption,
        question_id: questions?.question.question_id,
        cpf: cpfValid,
      });

      const responseData = data?.data;
      const nextQuestion = responseData as QuestionsPayload | undefined;

      if (responseData?.status === "next" && nextQuestion?.question) {
        setData(nextQuestion);
        setSelectedOption(null);
        return;
      }

      if (responseData?.status === "verified") {
        setToken(responseData.token ?? null);
        setRegisterData({
          ...(registerData ?? {}),
          cpf: cpfValid,
          id: responseData.id,
          nome: responseData.name,
        });
        resetRecoveryFlow();
        showInfo(
          "Recuperação concluída",
          "Seus dados foram confirmados com sucesso.",
        );
        router.replace("/(recovery)/change-password");
        return;
      }

      if (responseData?.status === "failed") {
        showWarning(
          "Não foi possível confirmar",
          "Não foi possível confirmar seus dados. Vamos reiniciar o processo de recuperação.",
          () => {
            resetRecoveryFlow();
            router.replace("/(recovery)/cpf");
          },
        );
        return;
      }

      showWarning(
        "Erro",
        data?.message || "Nao foi possivel validar a resposta.",
      );
    } catch (error: any) {
      const status = error?.response?.status;
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        "Nao foi possivel validar a resposta.";

      if (status === 423) {
        showWarning("Recuperação bloqueada", errorMessage, () => {
          resetRecoveryFlow();
          router.replace("/login");
        });
        return;
      }

      if (
        error?.response?.data?.data?.message ===
        "Sessão de recuperação expirada. Reinicie o processo."
      ) {
        showWarning("Erro", errorMessage, () => {
          resetRecoveryFlow();
          router.replace("/(recovery)/cpf");
        });

        return;
      }

      showWarning("Erro", errorMessage, () => {
        resetRecoveryFlow();
        router.replace("/login");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    resetRecoveryFlow();
    router.replace("/(recovery)/cpf");
  };

  if (!questions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Image
            source={require("@/assets/images/logo-verde.png")}
            resizeMode="cover"
            style={styles.logo}
          />
          <Text style={styles.title}>Parcela Diária</Text>
          <Text style={styles.subtitle}>
            Nenhuma pergunta foi carregada para este fluxo.
          </Text>
          <ButtonComponent
            title="Voltar"
            onPress={handleGoBack}
            iconLeft="arrow-back"
            iconRight={null}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backLinkContainer}
          activeOpacity={0.8}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={18} color={Colors.green.primary} />
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>

        <Image
          source={require("@/assets/images/logo-verde.png")}
          resizeMode="cover"
          style={styles.logo}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Parcela Diária</Text>
          <Text style={styles.subtitle}>Responda a pergunta de segurança</Text>

          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Pergunta {questions?.index || 0} de {questions?.total || 0}
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionBadge}>
              <FontAwesome
                name="question-circle"
                size={18}
                color={Colors.green.primary}
              />
              <Text style={styles.questionBadgeText}>
                {questions?.question.field}
              </Text>
            </View>

            <Text style={styles.questionLabel}>
              {questions?.question.label}
            </Text>

            <View style={styles.optionsContainer}>
              {questions?.question.options.map((option) => {
                const isSelected = selectedOption === option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedOption(option)}
                  >
                    <View
                      style={[
                        styles.optionIndicator,
                        isSelected && styles.optionIndicatorSelected,
                      ]}
                    >
                      {isSelected ? (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={Colors.white}
                        />
                      ) : null}
                    </View>

                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <ButtonComponent
            title="Continuar"
            onPress={handleSubmit}
            iconLeft={null}
            iconRight="arrow-forward"
            disabled={!selectedOption || isLoading}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backLinkContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.green.primary,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  content: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.green.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.text,
    textAlign: "center",
    marginBottom: 24,
  },
  progressHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.gray.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.green.primary,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 24,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.green.primary,
  },
  questionCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  questionBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.green.primary,
    textTransform: "capitalize",
  },
  questionLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    lineHeight: 28,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  optionButtonSelected: {
    borderColor: Colors.green.primary,
    backgroundColor: "#ECFDF5",
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: Colors.white,
  },
  optionIndicatorSelected: {
    borderColor: Colors.green.primary,
    backgroundColor: Colors.green.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: Colors.green.primary,
  },
});
