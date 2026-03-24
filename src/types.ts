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

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  theme: string;
  address: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryDate?: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  notes: string;
  artwork?: { name: string; data: string } | null;
  createdAt: string;
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
  createdAt?: string; // YYYY-MM-DDTHH:mm:ss.sssZ format
}
