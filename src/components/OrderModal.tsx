import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { compressImage } from '../utils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id'> | Order) => void;
  initialData?: Partial<Order> | null;
  selectedDate?: string;
}

export function OrderModal({ isOpen, onClose, onSave, initialData, selectedDate }: OrderModalProps) {
  const [clientName, setClientName] = useState('');
  const [product, setProduct] = useState('');
  const [value, setValue] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pendente');
  const [notes, setNotes] = useState('');
  const [artwork, setArtwork] = useState<{ name: string; data: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setClientName(initialData.clientName || '');
        setProduct(initialData.product || '');
        setValue(initialData.value?.toString() || '');
        setDownPayment(initialData.downPayment?.toString() || '');
        setDeliveryDate(initialData.deliveryDate || selectedDate || new Date().toISOString().split('T')[0]);
        setStatus(initialData.status || 'pendente');
        setNotes(initialData.notes || '');
        setArtwork(initialData.artwork || null);
      } else {
        setClientName('');
        setProduct('');
        setValue('');
        setDownPayment('');
        setDeliveryDate(selectedDate || new Date().toISOString().split('T')[0]);
        setStatus('pendente');
        setNotes('');
        setArtwork(null);
      }
    }
  }, [isOpen, initialData, selectedDate]);

  if (!isOpen) return null;

  const handleArtworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB');
        return;
      }
      try {
        const compressedDataUrl = await compressImage(file);
        setArtwork({
          name: file.name,
          data: compressedDataUrl
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Erro ao processar a imagem. Tente novamente.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData: any = {
      clientName,
      product,
      value: parseFloat(value) || 0,
      downPayment: downPayment ? parseFloat(downPayment) : undefined,
      deliveryDate,
      status,
      notes,
      artwork: artwork || undefined
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Arte / Referência</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-sky-400 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                {artwork ? (
                  <div className="flex flex-col items-center">
                    <img src={artwork.data} alt="Preview" className="h-32 object-contain mb-4 rounded-lg shadow-sm" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 hover:text-sky-500">
                        <span>Trocar imagem</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={handleArtworkUpload} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 mt-4">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 hover:text-sky-500">
                        <span>Fazer upload de um arquivo</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={handleArtworkUpload} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF até 10MB</p>
                  </>
                )}
              </div>
            </div>
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
