import { create } from 'zustand';

interface QRCodeData {
  base64QrCode: string;
  qrCode: string;
  status_code: number;
  transactionId: string;
  txId: string;
}

export type PropsQRCode = {
  bank_tax: string;
  payment: QRCodeData;
  qty: number;
  total_with_tax: number;
  totalamount: number;
}

interface QRCodeStore {
  qrCodeData: PropsQRCode | null;
  setQRCodeData: (data: PropsQRCode) => void;
  clearQRCodeData: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useQRCodeStore = create<QRCodeStore>((set) => ({
  qrCodeData: null,
  isLoading: false,
  
  setQRCodeData: (data: PropsQRCode) => set({ qrCodeData: data }),
  
  clearQRCodeData: () => set({ qrCodeData: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Tipos exportados para uso em outros arquivos
export type { QRCodeData, QRCodeStore };