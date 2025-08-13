import { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getClientInfo, PropsDataUser } from "@/services/loans";

import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";

export default function ProfileScreen() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<PropsDataUser>({} as PropsDataUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInfo = async () => {
            try {
                const info = await getClientInfo();
                setUserInfo(info);
            } catch (error) {
                console.error('Erro ao carregar informações do usuário:', error);
            } finally {
                setLoading(false);
            }
        }

        getInfo();
    }, [])

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={['#FAFBFC', '#F8FAFC', '#FFFFFF']}
                    style={styles.gradientBackground}
                >
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9BD13D" />
                        <Text style={styles.loadingText}>Carregando perfil...</Text>
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
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <FontAwesome5 name="user-circle" size={24} color="#9BD13D" />
                            <Text style={styles.headerTitle}>Meu Perfil</Text>
                        </View>
                    </View>
                    <Text style={styles.headerSubtitle}>
                        Informações da sua conta
                    </Text>
                </View>

                {/* Profile Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Personal Information Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="person" size={20} color="#9BD13D" />
                            <Text style={styles.cardTitle}>Informações Pessoais</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="badge" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Nome:</Text>
                            <Text style={styles.infoValue}>{userInfo.name || 'Não informado'}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="email" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>E-mail:</Text>
                            <Text style={styles.infoValue}>{userInfo.email || 'Não informado'}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="phone" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Telefone:</Text>
                            <Text style={styles.infoValue}>
                                {userInfo.phone 
                                    ? userInfo.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                                    : 'Não informado'
                                }
                            </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="credit-card" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>CPF:</Text>
                            <Text style={styles.infoValue}>{userInfo.cpf || 'Não informado'}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="cake" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Data de Nascimento:</Text>
                            <Text style={styles.infoValue}>{userInfo.birth || 'Não informado'}</Text>
                        </View>
                    </View>

                    {/* Address Information Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="location-on" size={20} color="#9BD13D" />
                            <Text style={styles.cardTitle}>Endereço</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="home" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Rua:</Text>
                            <Text style={styles.infoValue}>{userInfo.address || 'Não informado'}</Text>
                        </View>
                        
                        {/* <View style={styles.infoRow}>
                            <MaterialIcons name="tag" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Número:</Text>
                            <Text style={styles.infoValue}>{userInfo.neighborhood || 'Não informado'}</Text>
                        </View> */}
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="apartment" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Bairro:</Text>
                            <Text style={styles.infoValue}>{userInfo.neighborhood || 'Não informado'}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="location-city" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Cidade:</Text>
                            <Text style={styles.infoValue}>{userInfo.city || 'Não informado'}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="map" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>Estado:</Text>
                            <Text style={styles.infoValue}>{userInfo.uf || 'Não informado'}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <MaterialIcons name="markunread-mailbox" size={16} color="#6B7280" />
                            <Text style={styles.infoLabel}>CEP:</Text>
                            <Text style={styles.infoValue}>{userInfo.zip_code || 'Não informado'}</Text>
                        </View>
                    </View>

                    {/* Financial Information Card */}
                   
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    )
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
        fontSize: 24,
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
        paddingVertical: 8,
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
        flex: 2,
        textAlign: 'right',
    },
});