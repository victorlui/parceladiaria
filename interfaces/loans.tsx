import { InstallmentsProps } from "./installments";

export interface LoansProps {
  amount: string;
  customer: number;
  date: string;
  due_date: string;
  frequency: string;
  id: number;
  installment_amount: string;
  installments: InstallmentsProps[];
  loan_interest: string;
  origin: string;
  // Atributos derivados para a tela de empréstimos
  totalInstallments?: number;
  paidCount?: number;
  isPaidOff?: boolean;
}
