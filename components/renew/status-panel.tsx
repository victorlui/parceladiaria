import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import type { RenewProps } from "@/store/renew";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RenewStatusPanelProps = {
  renew: RenewProps;
  faqExpanded: boolean;
  onToggleFaq: () => void;
  onBack?: () => void;
  onPayPress: () => void;
  onRenewPress: () => void;
  hideBackButton?: boolean;
};

type ChecklistVariant = "success" | "pending" | "active" | "muted";

const pluralizeParcelas = (count: number) =>
  `${count} parcela${count === 1 ? "" : "s"}`;

const getReleaseDateText = (date: string) => date || "--/--/----";

const getGateMessage = (renew: RenewProps) =>
  renew.message?.trim() || "Realize o pagamento das parcelas em atraso";

const getFaqContent = (
  renew: RenewProps,
  gateActive: boolean,
  gateBlocked: boolean,
  gateRefinBlocked: boolean,
  isRenewReady: boolean,
) => {
  if (gateRefinBlocked) {
    return {
      title: "Paguei as parcelas, por que ainda não posso renovar?",
      description:
        "A renovação depende de duas coisas juntas: ter quitado as parcelas em aberto do contrato atual e aguardado a data de liberação informada acima.",
    };
  }

  const overdueCount = renew.gate?.x_a_pagar ?? 0;
  const overdueText =
    overdueCount > 0
      ? `No seu caso, é preciso quitar ${pluralizeParcelas(overdueCount)} em atraso para sair do bloqueio.`
      : "No seu caso, ainda existe um bloqueio por parcelas vencidas no contrato atual.";

  if (isRenewReady) {
    return {
      title: "Como funciona a renovação?",
      description:
        "Ao confirmar a renovação, o novo valor é depositado na sua conta e o saldo devedor atual é quitado automaticamente.",
    };
  }

  if (gateActive && gateBlocked) {
    return {
      title: renew.can_renew
        ? "Por que preciso pagar as parcelas em atraso antes?"
        : "Paguei as parcelas restantes, por que ainda não posso renovar?",
      description: renew.can_renew
        ? `${overdueText} Depois disso, a renovação é liberada automaticamente.`
        : "Além das parcelas mínimas e da data de liberação, sua renovação também depende do limite de parcelas em atraso do contrato atual.",
    };
  }

  return {
    title: "Paguei as parcelas restantes, por que não posso renovar?",
    description:
      "A renovação depende de duas coisas juntas: ter quitado as parcelas mínimas do contrato e aguardar a data de liberação.",
  };
};

const ChecklistItem = ({
  title,
  description,
  badge,
  variant,
  step,
}: {
  title: string;
  description?: string;
  badge?: string;
  variant: ChecklistVariant;
  step?: number;
}) => {
  const isSuccess = variant === "success";
  const isActive = variant === "active";
  const isMuted = variant === "muted";

  return (
    <View style={styles.checklistRow}>
      {isSuccess ? (
        <View style={[styles.iconWrapper, styles.iconSuccess]}>
          <Ionicons name="checkmark" size={16} color="#10B981" />
        </View>
      ) : (
        <View
          style={[
            styles.stepBadge,
            isActive && styles.stepBadgeActive,
            isMuted && styles.stepBadgeMuted,
          ]}
        >
          {step ? (
            <Text
              style={[
                styles.stepBadgeText,
                isActive && styles.stepBadgeActiveText,
                isMuted && styles.stepBadgeMutedText,
              ]}
            >
              {step}
            </Text>
          ) : (
            <Ionicons
              name="lock-closed"
              size={13}
              color={isMuted ? "#94A3B8" : "#64748B"}
            />
          )}
        </View>
      )}

      <View style={styles.checklistTextBlock}>
        <View style={styles.checklistTitleRow}>
          <Text
            style={[
              styles.checklistTitle,
              isMuted && styles.checklistTitleMuted,
              isSuccess && styles.checklistTitleSuccess,
            ]}
          >
            {title}
          </Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        {description ? (
          <Text
            style={[
              styles.checklistDescription,
              isMuted && styles.checklistDescriptionMuted,
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const RenewStatusPanel: React.FC<RenewStatusPanelProps> = ({
  renew,
  faqExpanded,
  onToggleFaq,
  onBack,
  onPayPress,
  onRenewPress,
  hideBackButton = false,
}) => {
  const remainingPaid = renew.remaining_paid ?? 0;
  const releaseDate = getReleaseDateText(renew.date);
  const remainingLabel =
    remainingPaid > 0
      ? `Parcelas restantes: ${remainingPaid}`
      : "Parcelas restantes quitadas";

  const gateActive = !!renew.gate?.ativo;
  const gateBlocked = gateActive && !!renew.gate?.bloqueado;

  const gateRefinAtivo = !!renew.gate_refin?.ativo;
  const gateRefinBloqueado = gateRefinAtivo && !!renew.gate_refin?.bloqueado;
  const refinParcelasAberto = renew.gate_refin?.parcelas_em_aberto ?? 0;
  const refinDataLiberacao = renew.gate_refin?.data_liberacao_br ?? releaseDate;
  const refinHideOverdue = !!renew.hide_overdue_step;

  const isRenewReady = renew.can_renew && !gateBlocked && !gateRefinBloqueado;

  const canPromiseRelease =
    gateBlocked &&
    renew.can_renew &&
    remainingPaid <= (renew.gate?.x_a_pagar ?? 0);

  const usesLegacyFlow = !gateActive && !gateRefinAtivo;

  const statusTitle = isRenewReady
    ? "Nova oferta de crédito"
    : "Renovação em breve";
  const statusDescription = isRenewReady
    ? "Você pode renovar seu empréstimo agora mesmo."
    : gateRefinBloqueado
      ? "Veja abaixo o que falta para liberar sua nova oferta de crédito."
      : gateBlocked && renew.can_renew
        ? "Falta um passo: veja abaixo como liberar."
        : "A renovação estará disponível a partir da data abaixo.";

  const faq = getFaqContent(
    renew,
    gateActive,
    gateBlocked,
    gateRefinBloqueado,
    isRenewReady,
  );

  const renderLegacyChecklist = () => {
    if (isRenewReady) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>TUDO PRONTO</Text>

          <ChecklistItem title="Parcelas mínimas pagas" variant="success" />

          <View style={styles.divider} />

          <ChecklistItem title="Data de liberação atingida" variant="success" />
        </View>
      );
    }

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>O QUE FALTA PARA LIBERAR</Text>

        <ChecklistItem title={remainingLabel} step={1} variant="pending" />

        <View style={styles.divider} />

        <ChecklistItem
          title="Aguardar a data de liberação"
          description={`Disponível a partir de ${releaseDate}.`}
          step={2}
          variant="pending"
        />

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={18} color="#92400E" />
          <Text style={styles.warningText}>
            Pagar as parcelas restantes não libera a renovação antes da data. É
            preciso quitar as parcelas e aguardar a data de liberação.
          </Text>
        </View>
      </View>
    );
  };

  const renderGateRefinChecklist = () => {
    if (isRenewReady) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>TUDO PRONTO</Text>

          <ChecklistItem
            title="Parcelas do contrato atual quitadas"
            variant="success"
          />

          <View style={styles.divider} />

          <ChecklistItem title="Data de liberação atingida" variant="success" />
        </View>
      );
    }

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>O QUE FALTA PARA LIBERAR</Text>

        <ChecklistItem
          title={`Parcelas restantes: ${refinParcelasAberto}`}
          description="Quitar as parcelas que ainda faltam do seu contrato atual."
          step={1}
          variant="pending"
        />

        <View style={styles.divider} />

        <ChecklistItem
          title="Aguardar a data de liberação"
          description={`Disponível a partir de ${refinDataLiberacao}.`}
          step={2}
          variant="pending"
        />

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={18} color="#92400E" />
          <Text style={styles.warningText}>
            Pagar as parcelas restantes não libera a renovação. É preciso ter
            pago as parcelas e aguardar a data de liberação.
          </Text>
        </View>
      </View>
    );
  };

  const renderGateChecklist = () => {
    if (isRenewReady) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>TUDO PRONTO</Text>

          <ChecklistItem title="Parcelas mínimas pagas" variant="success" />

          <View style={styles.divider} />

          <ChecklistItem title="Data de liberação atingida" variant="success" />

          <View style={styles.divider} />

          <ChecklistItem
            title="Parcelas em dia"
            variant="success"
            badge="NOVO"
          />
        </View>
      );
    }

    if (gateBlocked && renew.can_renew) {
      return (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>O QUE FALTA PARA LIBERAR</Text>

          <ChecklistItem title="Parcelas mínimas pagas" variant="success" />

          <View style={styles.divider} />

          <ChecklistItem title="Data de liberação atingida" variant="success" />

          <View style={styles.divider} />

          <ChecklistItem
            title={getGateMessage(renew)}
            variant="active"
            step={3}
            badge="NOVO"
          />
        </View>
      );
    }

    const showOverdueStep = !refinHideOverdue;

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>O QUE FALTA PARA LIBERAR</Text>

        <ChecklistItem title={remainingLabel} step={1} variant="pending" />

        <View style={styles.divider} />

        <ChecklistItem
          title="Aguardar a data de liberação"
          description={`Disponível a partir de ${releaseDate}.`}
          step={2}
          variant="pending"
        />

        {showOverdueStep ? (
          <>
            <View style={styles.divider} />

            {gateBlocked ? (
              <ChecklistItem
                title="Realize o pagamento das parcelas em atraso"
                description="Esse item será liberado quando as demais etapas estiverem concluídas."
                variant="muted"
              />
            ) : (
              <ChecklistItem
                title="Parcelas em dia"
                variant="success"
                badge="NOVO"
              />
            )}
          </>
        ) : null}

        <View style={styles.warningBox}>
          <Ionicons name="warning" size={18} color="#92400E" />
          <Text style={styles.warningText}>
            {gateBlocked
              ? "As parcelas em atraso também entram na liberação da renovação. Quite o que estiver vencido e aguarde a data de liberação."
              : "Estar com as parcelas em dia não libera a renovação antes da data. Aguarde o momento informado para continuar."}
          </Text>
        </View>
      </View>
    );
  };

  const showPrimaryButton = true;

  let primaryButton;

  if (isRenewReady) {
    primaryButton = (
      <ButtonComponent
        title="Renovar agora"
        onPress={onRenewPress}
        iconLeft="refresh"
        iconRight={null}
      />
    );
  } else if (gateActive && gateBlocked && canPromiseRelease) {
    primaryButton = (
      <ButtonComponent
        title="Pagar parcelas e liberar"
        onPress={onPayPress}
        iconLeft="cash-outline"
        iconRight={null}
      />
    );
  } else {
    primaryButton = (
      <ButtonComponent
        title="🔒 Renovação Indisponível"
        onPress={() => null}
        iconLeft={null}
        iconRight={null}
        disabled
        mutedDisabled
      />
    );
  }

  return (
    <View style={styles.screenContent}>
      <View>
        {!hideBackButton && onBack ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={22} color="#0F9A94" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroGlowLarge} />
          <View style={styles.heroGlowSmall} />
          <Text style={styles.eyebrow}>SUA RENOVAÇÃO</Text>
          <Text style={styles.heroTitle}>{statusTitle}</Text>
          <Text style={styles.heroDescription}>{statusDescription}</Text>

          {!renew.can_renew || gateRefinBloqueado ? (
            <View style={styles.dateHighlightCard}>
              <Ionicons name="calendar" size={18} color="#F6E7A1" />
              <View>
                <Text style={styles.dateHighlightLabel}>
                  DISPONÍVEL A PARTIR DE
                </Text>
                <Text style={styles.dateHighlightValue}>
                  {gateRefinBloqueado ? refinDataLiberacao : releaseDate}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {gateRefinBloqueado
          ? renderGateRefinChecklist()
          : usesLegacyFlow
            ? renderLegacyChecklist()
            : renderGateChecklist()}
      </View>

      <View style={styles.actionsSection}>
        {showPrimaryButton ? primaryButton : null}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.faqCard}
          onPress={onToggleFaq}
        >
          <View style={styles.faqHeader}>
            <View style={styles.faqIcon}>
              <Ionicons name="help" size={14} color="#0F766E" />
            </View>
            <Text style={styles.faqTitle}>{faq.title}</Text>
            <Ionicons
              name={faqExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748B"
            />
          </View>

          {faqExpanded ? (
            <Text style={styles.faqDescription}>{faq.description}</Text>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F9A94",
  },
  heroCard: {
    overflow: "hidden",
    backgroundColor: Colors.green.button,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 14,
  },
  heroGlowLarge: {
    position: "absolute",
    right: -36,
    top: -12,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroGlowSmall: {
    position: "absolute",
    right: 92,
    bottom: -36,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(255,255,255,0.72)",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.88)",
    maxWidth: "88%",
  },
  dateHighlightCard: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateHighlightLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  dateHighlightValue: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFF",
    lineHeight: 30,
  },
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.4,
    marginBottom: 16,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checklistTextBlock: {
    flex: 1,
    paddingTop: 2,
  },
  checklistTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  checklistTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  checklistTitleSuccess: {
    color: "#0F172A",
  },
  checklistTitleMuted: {
    color: "#94A3B8",
  },
  checklistDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  checklistDescriptionMuted: {
    color: "#94A3B8",
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeActive: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  stepBadgeMuted: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  stepBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },
  stepBadgeActiveText: {
    color: "#D97706",
  },
  stepBadgeMutedText: {
    color: "#94A3B8",
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
    color: "#B45309",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  warningBox: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    padding: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#92400E",
  },
  actionsSection: {
    marginTop: 18,
    gap: 16,
  },
  faqCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  faqIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  faqTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  faqDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
});

export default RenewStatusPanel;
