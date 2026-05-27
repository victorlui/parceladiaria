import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_UUID_KEY = "device_uuid";
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const API_SECRET = process.env.EXPO_PUBLIC_SECRET;

export async function getDeviceUUID(): Promise<string> {
  try {
    const storedUUID = await SecureStore.getItemAsync(DEVICE_UUID_KEY);

    if (storedUUID) {
      return storedUUID;
    }

    const newUUID = Crypto.randomUUID();

    await SecureStore.setItemAsync(DEVICE_UUID_KEY, newUUID);

    return newUUID;
  } catch (error) {
    console.error("UUID Error:", error);

    return Crypto.randomUUID();
  }
}

async function generateSignature(
  uuid: string,
  secret: string,
  timestamp: string,
) {
  const payload = `${uuid}${timestamp}${secret}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload,
  );
  return hash;
}

export async function createSecurityHeaders() {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const uuid = await getDeviceUUID();

  const signature = await generateSignature(uuid, API_SECRET!, timestamp);

  return {
    "X-Signature": signature,
    "X-UUID": uuid,
    "X-Timestamp": timestamp,
    "X-UserAgent": "mobile",
    "X-Version-app": APP_VERSION,
  };
}
