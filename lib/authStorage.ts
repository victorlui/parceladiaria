import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// Configuração de segurança que permite o iOS liberar as chaves
// durante a inicialização por notificações (Cold Start)
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const saveToken = async (token: string, user: any) => {
  // Passamos as opções na escrita para definir a regra de acesso no iOS
  await SecureStore.setItemAsync(TOKEN_KEY, token, secureStoreOptions);
  await SecureStore.setItemAsync(
    USER_KEY,
    JSON.stringify(user),
    secureStoreOptions,
  );
};

export const getUser = async () => {
  const user = await SecureStore.getItemAsync(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};
