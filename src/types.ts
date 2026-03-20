export type OrderStatus = 'pendente' | 'em_producao' | 'enviado' | 'concluido';

export interface Order {
  id: string;
  clientName: string;
  product: string;
  value: number;
  deliveryDate: string; // YYYY-MM-DD format
  status: OrderStatus;
  notes: string;
  quoteFile?: { name: string; data: string };
}
