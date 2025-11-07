import { Colors } from "@/constants/Colors";
import { LoansProps } from "@/interfaces/loans";
import { Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { format, parse, parseISO } from "date-fns";

interface Props {
  loan: LoansProps;
}

const ItemLoan: React.FC<Props> = ({ loan }) => {
  const statusLabel = loan.isPaidOff ? "QUITADO" : "ATIVO";
  const statusColor = loan.isPaidOff
    ? Colors.blue.primary
    : Colors.green.primary;

  const formatCurrency = (value: string | number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  // Apenas datas: refatorado para date-fns com parse local
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return "";
    const base = dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
    const localParsed = parse(base, "yyyy-MM-dd", new Date());
    const dt = isNaN(localParsed.getTime()) ? parseISO(dateStr) : localParsed;
    return format(dt, "dd/MM/yyyy");
  };

  // Novo: controla abertura/fechamento do colapse
  const [open, setOpen] = React.useState(false);
  const total = loan.totalInstallments || loan.installments?.length || 0;

  const formatDateBRLocal = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr
      .split("T")[0]
      .split("-")
      .map((v) => Number(v));
    const dt = new Date(y, (m || 1) - 1, d || 1); // constrói como hora local
    return new Intl.DateTimeFormat("pt-BR").format(dt);
  };

  return (
    <View style={[styles.card, { borderColor: statusColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardAmount}>{formatCurrency(loan.amount)}</Text>

        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <FontAwesome5
            name="calendar-check"
            size={14}
            color={Colors.gray.primary}
          />
          <Text style={styles.rowText}>
            {loan.paidCount} de {loan.totalInstallments} parcelas pagas
          </Text>
        </View>

        <View style={styles.row}>
          <FontAwesome5
            name="money-bill-wave"
            size={13}
            color={Colors.gray.primary}
          />
          <Text style={styles.rowText}>
            Parcelas de {formatCurrency(loan.installment_amount)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.row}>
          <MaterialIcons
            name="access-time-filled"
            size={14}
            color={Colors.gray.primary}
          />
          <Text style={[styles.rowText, { color: Colors.gray.primary }]}>
            {formatDateBR(String(loan.date))}
          </Text>
        </View>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => setOpen((v) => !v)}
        >
          <Text style={[styles.detailsText]}>
            {open ? "Ocultar detalhes" : "Ver detalhes"}
          </Text>
          <Entypo
            name="chevron-small-right"
            size={20}
            color={Colors.green.primary}
            style={{ transform: [{ rotate: open ? "90deg" : "0deg" }] }}
          />
        </TouchableOpacity>
      </View>

      {/* Novo: conteúdo do colapse com as parcelas */}
      {open && (
        <View style={styles.collapseSection}>
          <View style={styles.collapseHeader}>
            <MaterialIcons
              name="list-alt"
              size={16}
              color={Colors.green.primary}
            />
            <Text style={styles.collapseTitle}>Detalhes das Parcelas</Text>
          </View>

          <View style={{ gap: 10 }}>
            {(loan.installments || [])
              .slice()
              .sort((a, b) => a.installment - b.installment)
              .map((inst) => {
                const isPaid = inst.paid === "Sim";
                const badgeColor = isPaid ? Colors.green.primary : "#F59E0B";
                const badgeText = isPaid ? "PAGA" : "PENDENTE";

                return (
                  <View
                    key={inst.id}
                    style={[
                      styles.installmentCard,
                      {
                        borderColor: isPaid
                          ? Colors.green.primary
                          : Colors.borderColor,
                      },
                    ]}
                  >
                    <View style={styles.installmentHeader}>
                      <Text style={styles.installmentTitle}>
                        Parcela {inst.installment}/{total}
                      </Text>
                      <Text style={styles.installmentAmount}>
                        {formatCurrency(inst.amount)}
                      </Text>
                    </View>

                    <View style={styles.installmentFooter}>
                      <View style={styles.row}>
                        <MaterialIcons
                          name="event"
                          size={13}
                          color={Colors.gray.primary}
                        />
                        <Text style={styles.rowText}>
                          Vencimento: {formatDateBRLocal(inst.due_date)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.installmentStatusPill,
                          { backgroundColor: badgeColor },
                        ]}
                      >
                        <Text style={styles.installmentStatusText}>
                          {badgeText}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderLeftWidth: 3.5,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  cardBody: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowText: {
    color: Colors.gray.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  detailsText: {
    fontWeight: "500",
    color: Colors.green.primary,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Novo: estilos do colapse
  collapseSection: {
    marginTop: 8,
    gap: 8,
  },
  collapseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 4,
  },
  collapseTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.green.primary,
  },
  installmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  installmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  installmentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  installmentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  installmentFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  installmentStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  installmentStatusText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default ItemLoan;
