import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth';
import { router } from 'expo-router';

interface DrawerMenuProps {
  isVisible: boolean;
  onClose: () => void;
  showOnlyLogout?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.8;

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isVisible, onClose, showOnlyLogout = false }) => {
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const {logout} = useAuthStore()

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const allMenuItems = [
    {
      icon: 'home-outline',
      title: 'Início',
      onPress: () => {
        console.log('Início pressed');
        onClose();
      },
    },
    {
      icon: 'wallet-outline',
      title: 'Meus Empréstimos',
      onPress: () => {
        console.log('Meus Empréstimos pressed');
        onClose();
      },
    },
     {
      icon: 'reload-outline',
      title: 'Renovação',
      onPress: () => {
        console.log('Configurações pressed');
        onClose();
      },
    },
    {
      icon: 'person-outline',
      title: 'Meu Perfil',
      onPress: () => {
        console.log('Perfil pressed');
        onClose();
      },
    },
   
   
    {
      icon: 'log-out-outline',
      title: 'Sair',
      onPress: () => {
       logout()
       router.replace('/login')
        onClose();
      },
    },
  ];

  const logoutOnlyItems = [
    {
      icon: 'log-out-outline',
      title: 'Sair',
      onPress: () => {
       logout()
       router.replace('/login')
        onClose();
      },
    },
  ];

  const menuItems = showOnlyLogout ? logoutOnlyItems : allMenuItems;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            opacity: overlayOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            backgroundColor: 'white',
            transform: [{ translateX: slideAnim }],
            elevation: 16,
            shadowColor: '#000',
            shadowOffset: {
              width: 2,
              height: 0,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          },
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View className="bg-green-100 px-6 py-8">
            <View className="flex-row items-center justify-between">
              <View className='flex-1'>
               
               <Image source={require('@/assets/images/parcela-logo.png')} className="w-full h-16" resizeMode='contain' />
              </View>
              {/* <TouchableOpacity
                onPress={onClose}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity> */}
            </View>
          </View>

          {/* Menu Items */}
          <View className="flex-1 pt-4">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className="flex-row items-center px-6 py-4 border-b border-gray-100"
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color="#374151"
                  style={{ marginRight: 16 }}
                />
                <Text className="text-gray-700 text-base font-medium">
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View className="px-6 py-4 border-t border-gray-200">
            <Text className="text-gray-500 text-xs text-center">
              Versão 1.0.0
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

export default DrawerMenu;