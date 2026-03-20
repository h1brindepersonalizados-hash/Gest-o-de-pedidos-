import React from 'react';
import { Order } from '../types';
import { X, Edit2, Trash2, Package, Paperclip } from 'lucide-react';
import { formatCurrency } from '../utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DayOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onAddOrder: (date: string) => void;
}

export function DayOrdersModal({
  isOpen,
  onClose,
  date,
  orders,
  onEdit,
  onDelete,
  onAddOrder,
}: DayOrdersModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  if (!isOpen || !date) return null;

  const formattedDate = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  const isoDate = format(date, 'yyyy-MM-dd');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_producao':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_producao':
        return 'Em Produção';
      case 'enviado':
        return 'Enviado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 capitalize">{formattedDate}</h2>
            <p className="text-sm text-gray-500">{orders.length} pedido(s) neste dia</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">Nenhum pedido para este dia.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{order.clientName}</h3>
                      <p className="text-sm text-gray-600">{order.product}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(order)}
                        className="rounded p-1.5 text-gray-500 hover:bg-white hover:text-sky-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(order.id)}
                        className="rounded p-1.5 text-gray-500 hover:bg-white hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {confirmDeleteId === order.id && (
                    <div className="mt-2 rounded-lg bg-red-50 p-3 flex items-center justify-between">
                      <span className="text-sm text-red-800 font-medium">Excluir pedido?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs px-2 py-1 rounded bg-white text-gray-600 border border-gray-200"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            onDelete(order.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      {formatCurrency(order.value)}
                    </span>
                  </div>

                  {order.notes && (
                    <div className="mt-3 rounded-lg bg-white p-2 text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Obs:</span> {order.notes}
                    </div>
                  )}

                  {order.quoteFile && (
                    <div className="mt-3">
                      <a
                        href={order.quoteFile.data}
                        download={order.quoteFile.name}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-colors"
                      >
                        <Paperclip className="h-4 w-4" />
                        Ver Orçamento ({order.quoteFile.name})
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-6">
          <button
            onClick={() => onAddOrder(isoDate)}
            className="w-full rounded-lg bg-sky-400 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-sky-500"
          >
            + Adicionar Pedido Neste Dia
          </button>
        </div>
      </div>
    </div>
  );
}
