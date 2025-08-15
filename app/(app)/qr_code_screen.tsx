import { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { useQRCodeStore } from "@/store/qrcode";
import QRCode from 'react-native-qrcode-svg';
import Header from "@/components/Header";
import DrawerMenu from "@/components/DrawerMenu";

export default function QRCodeScreen() {
    const router = useRouter();
    const { qrCodeData } = useQRCodeStore();
    const [loading, setLoading] = useState(true);
     const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    useEffect(() => {
        // Simula um pequeno delay para mostrar o loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const copyQRCode = async () => {
        if (qrCodeData?.payment?.qrCode) {
            try {
                await Clipboard.setStringAsync(qrCodeData.payment.qrCode);
                Alert.alert(
                    "Sucesso",
                    "Código QR copiado para a área de transferência!",
                    [{ text: "OK" }]
                );
            } catch (error) {
                Alert.alert(
                    "Erro",
                    "Não foi possível copiar o código QR.",
                    [{ text: "OK" }]
                );
            }
        }
    };

    if (loading || !qrCodeData) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={['#FAFBFC', '#F8FAFC', '#FFFFFF']}
                    style={styles.gradientBackground}
                >
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9BD13D" />
                        <Text style={styles.loadingText}>Carregando QR Code...</Text>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#FAFBFC', '#F8FAFC', '#FFFFFF']}
                style={styles.gradientBackground}
            >
                {/* Header */}
                <Header
          title="QR Code de Pagamento"
          iconName="settings"
          iconLibrary="MaterialIcons"
          onMenuPress={() => setIsDrawerVisible(true)}
          showMenuButton={true}
          subtitle="Escaneie o código para realizar o pagamento"
        />

                

                {/* QR Code Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* QR Code Display Card */}
                    <View style={styles.qrCodeCard}>
                        <View style={styles.qrCodeContainer}>
                            <QRCode
                                value={qrCodeData.payment.qrCode}
                                size={200}
                                color="#1F2937"
                                backgroundColor="#FFFFFF"
                            />
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.copyButton}
                            onPress={copyQRCode}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="content-copy" size={20} color="#FFFFFF" />
                            <Text style={styles.copyButtonText}>Copiar Código QR</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Payment Information Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="payment" size={20} color="#9BD13D" />
                            <Text style={styles.cardTitle}>Informações do Pagamento</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="receipt" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Quantidade de Parcelas:</Text>
                            <Text style={styles.infoValue}>{qrCodeData.qty}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="attach-money" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Valor das Parcelas:</Text>
                            <Text style={styles.infoValue}>{formatCurrency(qrCodeData.totalamount)}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="account-balance" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Taxa Bancária:</Text>
                            <Text style={styles.infoValue}>{formatCurrency(Number(qrCodeData.bank_tax))}</Text>
                        </View>
                        
                        <View style={[styles.infoRow, styles.totalRow]}>
                            <MaterialIcons name="monetization-on" size={16} color="#9BD13D" />
                            <Text style={[styles.infoLabel, styles.totalLabel]}>Total a Pagar com Taxas:</Text>
                            <Text style={[styles.infoValue, styles.totalValue]}>{formatCurrency(qrCodeData.total_with_tax)}</Text>
                        </View>
                    </View>

                 

                    {/* Instructions Card */}
                    <View style={styles.instructionsCard}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="help-outline" size={20} color="#3B82F6" />
                            <Text style={styles.cardTitle}>Como Pagar</Text>
                        </View>
                        
                        <Text style={styles.instructionText}>
                            1. Abra o aplicativo do seu banco{"\n"}
                            2. Procure pela opção &quot;Pix&quot; ou &quot;QR Code&quot;{"\n"}
                            3. Escaneie o código QR acima{"\n"}
                            4. Confirme os dados e finalize o pagamento
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
            <DrawerMenu
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    gradientBackground: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(155, 209, 61, 0.1)',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(155, 209, 61, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 56,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    qrCodeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(155, 209, 61, 0.1)',
        alignItems: 'center',
    },
    qrCodeContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9BD13D',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#84CC16',
    },
    copyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(155, 209, 61, 0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(155, 209, 61, 0.1)',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
        textAlign: 'right',
    },
    totalRow: {
        borderBottomWidth: 0,
        paddingTop: 16,
        marginTop: 8,
        borderTopWidth: 2,
        borderTopColor: 'rgba(155, 209, 61, 0.3)',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#9BD13D',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#9BD13D',
    },
    transactionId: {
        fontSize: 12,
        fontFamily: 'monospace',
    },
    instructionsCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    instructionText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
});