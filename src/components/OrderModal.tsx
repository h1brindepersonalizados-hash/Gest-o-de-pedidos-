import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { X } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id'> | Order) => void;
  initialData?: Order | null;
  prefilledData?: Partial<Order> | null;
  selectedDate?: string;
}

export function OrderModal({ isOpen, onClose, onSave, initialData, prefilledData, selectedDate }: OrderModalProps) {
  const [clientName, setClientName] = useState('');
  const [product, setProduct] = useState('');
  const [value, setValue] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pendente');
  const [notes, setNotes] = useState('');
  const [quoteFile, setQuoteFile] = useState<{ name: string; data: string } | undefined>();

  useEffect(() => {
    if (initialData) {
      setClientName(initialData.clientName);
      setProduct(initialData.product);
      setValue(initialData.value.toString());
      setDeliveryDate(initialData.deliveryDate);
      setStatus(initialData.status);
      setNotes(initialData.notes);
      setQuoteFile(initialData.quoteFile);
    } else if (prefilledData) {
      setClientName(prefilledData.clientName || '');
      setProduct(prefilledData.product || '');
      setValue(prefilledData.value?.toString() || '');
      setDeliveryDate(prefilledData.deliveryDate || selectedDate || new Date().toISOString().split('T')[0]);
      setStatus(prefilledData.status || 'pendente');
      setNotes(prefilledData.notes || '');
      setQuoteFile(prefilledData.quoteFile);
    } else {
      setClientName('');
      setProduct('');
      setValue('');
      setDeliveryDate(selectedDate || new Date().toISOString().split('T')[0]);
      setStatus('pendente');
      setNotes('');
      setQuoteFile(undefined);
    }
  }, [initialData, prefilledData, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderData = {
      clientName,
      product,
      value: parseFloat(value) || 0,
      deliveryDate,
      status,
      notes,
      quoteFile,
    };

    if (initialData) {
      onSave({ ...orderData, id: initialData.id });
    } else {
      onSave(orderData);
    }
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo é muito grande. O limite é 2MB para armazenamento local.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuoteFile({ name: file.name, data: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nome do Cliente</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Produto Solicitado</label>
            <input
              type="text"
              required
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              placeholder="Ex: Caneca Personalizada"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data de Entrega</label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            >
              <option value="pendente">Pendente</option>
              <option value="em_producao">Em Produção</option>
              <option value="enviado">Enviado</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              placeholder="Detalhes adicionais do pedido..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Orçamento (PDF/Imagem)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {quoteFile && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm">
                <span className="truncate text-gray-600 max-w-[200px]">{quoteFile.name}</span>
                <button 
                  type="button" 
                  onClick={() => setQuoteFile(undefined)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remover
                </button>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-sky-400 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-sky-500"
            >
              Salvar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
