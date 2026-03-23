export type OrderStatus = 'pendente' | 'aguardando_arte' | 'imprimir' | 'costura' | 'em_producao' | 'enviado' | 'concluido';

export interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
}

export interface CompanySettings {
  name: string;
  document: string;
  phone: string;
  email: string;
  logo: string;
}

export interface Order {
  id: string;
  clientName: string;
  product: string;
  value: number;
  downPayment?: number;
  deliveryDate: string; // YYYY-MM-DD format
  seamstressDate?: string; // YYYY-MM-DD format
  status: OrderStatus;
  notes: string;
  quoteFile?: { name: string; data: string };
  artwork?: { name: string; data: string };
}
