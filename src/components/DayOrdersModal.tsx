import React from 'react';
import { Order } from '../types';
import { X, Edit2, Trash2, Package, Paperclip, Image as ImageIcon, Printer, ShoppingBag, Store } from 'lucide-react';
import { formatCurrency } from '../utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useValueVisibility } from '../contexts/ValueVisibilityContext';

interface DayOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onAddOrder: (date: string) => void;
  onPrint?: (order: Order) => void;
}

export function DayOrdersModal({
  isOpen,
  onClose,
  date,
  orders,
  onEdit,
  onDelete,
  onBulkDelete,
  onAddOrder,
  onPrint,
}: DayOrdersModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = React.useState<Set<string>>(new Set());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);
  const { isVisible } = useValueVisibility();

  if (!isOpen || !date) return null;

  const formattedDate = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  const isoDate = format(date, 'yyyy-MM-dd');

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

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'shopee':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-800" title="Origem: Shopee">
            <ShoppingBag className="h-3 w-3" />
            Shopee
          </span>
        );
      case 'elo7':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800" title="Origem: Elo7">
            <Store className="h-3 w-3" />
            Elo7
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-800" title="Origem: Venda Direta">
            <Package className="h-3 w-3" />
            Direta
          </span>
        );
    }
  };

  const handleSelectOrder = (id: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOrders(newSelected);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedOrders.size > 0) {
      onBulkDelete(Array.from(selectedOrders));
      setSelectedOrders(new Set());
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 print:hidden">
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
          {selectedOrders.size > 0 && (
            <div className="mb-4 flex items-center justify-between bg-sky-50 p-3 rounded-xl border border-sky-100">
              <span className="text-sm font-medium text-sky-800">
                {selectedOrders.size} {selectedOrders.size === 1 ? 'pedido selecionado' : 'pedidos selecionados'}
              </span>
              {isBulkDeleteConfirmOpen ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 mr-2">Tem certeza?</span>
                  <button 
                    onClick={() => setIsBulkDeleteConfirmOpen(false)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Sim, excluir
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsBulkDeleteConfirmOpen(true)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Selecionados
                </button>
              )}
            </div>
          )}

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
                      <div className="flex items-center gap-2 mb-0.5">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-sky-500 focus:ring-sky-500 mt-0.5"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                        <h3 className="font-semibold text-gray-800">{order.clientName}</h3>
                        {getSourceBadge(order.source)}
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{order.product}</p>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs ml-6">
                        {order.seamstressDate && (
                          <span className="text-pink-600 font-medium">
                            Costura: {format(parseISO(order.seamstressDate), "dd/MM/yyyy")}
                          </span>
                        )}
                        <span className="text-sky-600 font-medium">
                          Envio: {format(parseISO(order.deliveryDate), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onPrint && (
                        <button
                          onClick={() => onPrint(order)}
                          className="rounded p-1.5 text-gray-500 hover:bg-white hover:text-sky-500"
                          title="Imprimir Ficha"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(order)}
                        className="rounded p-1.5 text-gray-500 hover:bg-white hover:text-sky-500"
                      >
                        <Edit2 className="h-4 w-4" />
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
                      Total: {isVisible ? formatCurrency(order.value) : 'R$ •••••'}
                    </span>
                  </div>

                  {order.notes && (
                    <div className="mt-3 rounded-lg bg-white p-2 text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Obs:</span> {order.notes}
                    </div>
                  )}

                  {order.quoteFile && (
                    <div className="mt-3 flex flex-wrap gap-2">
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
