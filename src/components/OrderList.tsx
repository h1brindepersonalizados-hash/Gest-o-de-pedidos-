import React, { useState } from 'react';
import { Order } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils';
import { Edit2, Trash2, Paperclip, Package, Image as ImageIcon } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function OrderList({ orders, onEdit, onDelete, emptyMessage = "Nenhum pedido encontrado." }: OrderListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aguardando_arte': return 'bg-orange-100 text-orange-800';
      case 'imprimir': return 'bg-cyan-100 text-cyan-800';
      case 'costura': return 'bg-pink-100 text-pink-800';
      case 'em_producao': return 'bg-blue-100 text-blue-800';
      case 'enviado': return 'bg-purple-100 text-purple-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aguardando_arte': return 'Aguardando Arte';
      case 'imprimir': return 'Imprimir';
      case 'costura': return 'Costura';
      case 'em_producao': return 'Em Produção';
      case 'enviado': return 'Enviado';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <Package className="mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente / Produto</th>
              <th className="px-6 py-4 font-semibold">Datas (Costureira / Envio)</th>
              <th className="px-6 py-4 font-semibold">Valor Total</th>
              <th className="px-6 py-4 font-semibold">Entrada</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Arte</th>
              <th className="px-6 py-4 font-semibold">Orçamento</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{order.clientName}</div>
                  <div className="text-gray-500">{order.product}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-sm">
                    {order.seamstressDate && (
                      <span className="text-pink-600 font-medium" title="Data Limite Costureira">
                        Costura: {format(parseISO(order.seamstressDate), "dd/MM/yyyy")}
                      </span>
                    )}
                    <span className="text-sky-600 font-medium" title="Data de Envio ao Cliente">
                      Envio: {format(parseISO(order.deliveryDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {formatCurrency(order.value)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {order.downPayment ? formatCurrency(order.downPayment) : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {order.artwork ? (
                    <a
                      href={order.artwork.data}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-600"
                      title={order.artwork.name}
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span className="truncate max-w-[100px]">{order.artwork.name}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {order.quoteFile ? (
                    <a
                      href={order.quoteFile.data}
                      download={order.quoteFile.name}
                      className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-600"
                      title={order.quoteFile.name}
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="truncate max-w-[100px]">{order.quoteFile.name}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {confirmDeleteId === order.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setConfirmDeleteId(null)} className="text-xs px-2 py-1 rounded bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">Cancelar</button>
                      <button onClick={() => { onDelete(order.id); setConfirmDeleteId(null); }} className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Excluir</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(order)} className="p-1.5 text-gray-400 hover:text-sky-500 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(order.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
