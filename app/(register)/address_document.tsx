import { Button } from "@/components/Button";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { requestPermissions } from "@/utils";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function AddressDocument() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
    });

    console.log("result", result.assets);

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

   const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      
    }
  };

  return (
    <LayoutRegister isBack isLogo={false} disabledButton={!imageUri}>
      <View className="flex-1 gap-3">
        <Text className="text-xl font-bold">
          Envio de Comprovante de Endereço
        </Text>
        <Text className="text-base">
          Para garantir a segurança e autenticidade do seu cadastro, é
          necessário enviar uma foto válida do seu comprovante de endereço no
          máximo 90 dias, contendo nome, endereço e data. Nossa equipe irá
          analisar o documento enviado para confirmar que ele atende aos
          critérios estabelecidos.
        </Text>

        <View className="flex-1 ">
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="contain"
            />
          )}
        </View>

        <View className=" items-center justify-end mb-10 ">
          <TouchableOpacity
            className="underline p-5"
            onPress={pickImageFromGallery}
          >
            <Text className="underline font-medium">Selecionar imagem</Text>
          </TouchableOpacity>

          <Button title="Tirar foto" onPress={takePhoto} variant="secondary"  />
        </View>
      </View>
    </LayoutRegister>
  );
}
