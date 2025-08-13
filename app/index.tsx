import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth';
import { StatusCadastro } from '@/utils';

export default function Index() {
  const { restoreToken, token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Restaurar token primeiro
        await restoreToken();
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          // Se não tiver token ou usuário, ir para login
          if (!token && !user) {
            router.replace('/login');
            return;
          }

          // Se tiver token e user com type 'client', verificar status do cadastro
          if (user?.type === 'client') {
            // Verificar se user.status existe antes de fazer o switch
            if (!user.status) {
              router.replace('/(app)/home');
              return;
            }

            // Redirecionar baseado no status do cadastro para clients
            switch (user.status) {
              case StatusCadastro.ANALISE:
                router.replace('/analise_screen');
                break;
              case StatusCadastro.RECUSADO:
                router.replace('/recusado_screen');
                break;
              case StatusCadastro.DIVERGENTE:
                router.replace('/divergencia_screen');
                break;
              case StatusCadastro.REANALISE:
                router.replace('/reanalise_screen');
                break;
              case StatusCadastro.PRE_APROVADO:
                router.replace('/pre_aprovado_screen');
                break;
              case StatusCadastro.APROVADO:
                router.replace('/(app)/home');
                break;
              default:
                router.replace('/login');
                break;
            }
            return;
          }

          // Para outros tipos de usuário ou casos não especificados
          router.replace('/login');
        }, 100);
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
        router.replace('/login');
      }
    };

    initializeApp();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <StatusBar style="dark" />
      <ActivityIndicator size="large" color="#9BD13D" />
    </View>
  );
}