import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id'> | Order) => void;
  initialData?: Partial<Order> | null;
  selectedDate?: string;
}

export function OrderModal({ isOpen, onClose, onSave, initialData, selectedDate }: OrderModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [product, setProduct] = useState('');
  const [value, setValue] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pendente');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setClientName(initialData.clientName || '');
        setClientPhone(initialData.clientPhone || '');
        setProduct(initialData.product || '');
        setValue(initialData.value?.toString() || '');
        setDownPayment(initialData.downPayment?.toString() || '');
        setDeliveryDate(initialData.deliveryDate || selectedDate || new Date().toISOString().split('T')[0]);
        setStatus(initialData.status || 'pendente');
        setNotes(initialData.notes || '');
      } else {
        setClientName('');
        setClientPhone('');
        setProduct('');
        setValue('');
        setDownPayment('');
        setDeliveryDate(selectedDate || new Date().toISOString().split('T')[0]);
        setStatus('pendente');
        setNotes('');
      }
    }
  }, [isOpen, initialData, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData: any = {
      clientName,
      clientPhone,
      product,
      value: parseFloat(value) || 0,
      downPayment: downPayment ? parseFloat(downPayment) : undefined,
      deliveryDate,
      status,
      notes
    };

    if (initialData?.id) {
      orderData.id = initialData.id;
      orderData.createdAt = initialData.createdAt;
    }

    onSave(orderData as Order);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData?.id ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nome do Cliente</label>
            <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Telefone / Contato</label>
            <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Produto</label>
            <input type="text" required value={product} onChange={(e) => setProduct(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valor Total (R$)</label>
              <input type="number" step="0.01" required value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sinal / Entrada (R$)</label>
              <input type="number" step="0.01" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data de Entrega</label>
              <input type="date" required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400">
                <option value="pendente">Pendente</option>
                <option value="aguardando_arte">Aguardando Arte</option>
                <option value="imprimir">Para Imprimir</option>
                <option value="costura">Para Costura</option>
                <option value="em_producao">Em Produção</option>
                <option value="enviado">Enviado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full rounded-lg bg-sky-400 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-sky-500">
              Salvar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
