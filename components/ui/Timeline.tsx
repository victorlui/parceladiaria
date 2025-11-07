// TimelineItem.js
import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  amount: number;
  installment: number;
  totalInstallments: number;
  isLast: boolean;
}

const TimelineItem = ({
  amount,
  installment,
  totalInstallments,
  isLast,
}: Props) => (
  <View style={styles.container}>
    {/* COLUNA ESQUERDA: Linha e Ponto */}
    <View style={styles.timelineColumn}>
      {/* O Ponto (Bolinha) */}
      <View style={styles.dot}>
        {/* O círculo interno branco, se você precisar de um 'anel' */}
        <View style={styles.innerDot} />
      </View>

      {/* A Linha Vertical que conecta os pontos (ocultada no último item) */}
      {!isLast && <View style={styles.line} />}
    </View>

    {/* COLUNA DIREITA: Conteúdo */}
    <View style={styles.contentColumn}>
      <View style={styles.checkContainer}>
        <FontAwesome5 name="check" size={15} color={Colors.white} />
      </View>
      <View>
        <Text style={styles.contentText}>
          Pagamento:{" "}
          <Text style={{ color: Colors.green.primary }}>
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(amount)}
          </Text>{" "}
          <Text style={{ color: Colors.gray.primary }}>
            {" "}
            - Parcela {installment}/{totalInstallments}
          </Text>
        </Text>
        <Text style={{ color: Colors.gray.primary, fontWeight: "400" }}>
          Data de pagamento: 26/12/2023
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 20, // Espaçamento entre um item e o próximo
  },

  // Estilos da Coluna Esquerda (Linha e Ponto)
  timelineColumn: {
    alignItems: "center",
    marginRight: 15,
  },

  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white", // Cor da bolinha (Azul forte)
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Garante que a bolinha fique ACIMA da linha
    borderWidth: 1,
    borderColor: Colors.blue.primary, // Adiciona uma borda externa branca se precisar
  },
  innerDot: {
    // Cria o efeito de anel (a bolinha menor dentro)
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.blue.primary,
  },
  line: {
    // Posiciona a linha ABAIXO do ponto
    position: "absolute",
    top: 20, // Começa abaixo da altura do ponto (20px)
    bottom: -20, // Continua até o fim do container (ajustado pelo marginBottom)
    width: 1, // Espessura da linha
    backgroundColor: Colors.green.primary, // Cor da linha (Verde escuro da sua imagem)
  },

  // Estilos da Coluna Direita (Conteúdo)
  contentColumn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: Colors.borderColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkContainer: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: Colors.blue.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "bold",
  },
});

export default TimelineItem;
