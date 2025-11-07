export interface InstallmentsProps {
  amount: number;
  date: string;
  description: string;
  due_date: string;
  gateway: string;
  id: number;
  installment: number;
  paid: string;
  payment_date: string | null;
}
