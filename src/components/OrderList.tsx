import React, { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils';
import { Edit2, Trash2, Paperclip, Package, Image as ImageIcon, Printer, Filter, ShoppingBag, Store } from 'lucide-react';
import { useValueVisibility } from '../contexts/ValueVisibilityContext';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onPrint?: (order: Order) => void;
  emptyMessage?: string;
  showStatusFilter?: boolean;
}

export function OrderList({ orders, onEdit, onDelete, onBulkDelete, onPrint, emptyMessage = "Nenhum pedido encontrado.", showStatusFilter = false }: OrderListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
  const { isVisible } = useValueVisibility();

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

  const ALL_STATUSES: OrderStatus[] = [
    'pendente',
    'aguardando_arte',
    'imprimir',
    'costura',
    'em_producao',
    'enviado',
    'concluido'
  ];

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'todos') return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    } else {
      setSelectedOrders(new Set());
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

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <Package className="mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showStatusFilter && (
        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'todos')}
              className="ml-2 text-sm border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="todos">Todos</option>
              {ALL_STATUSES.map(status => (
                <option key={status} value={status}>{getStatusText(status)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedOrders.size > 0 && (
        <div className="flex items-center justify-between bg-sky-50 p-3 rounded-xl border border-sky-100">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                    checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-semibold">Cliente / Produto</th>
                <th className="px-6 py-4 font-semibold">Datas (Costureira / Envio)</th>
                <th className="px-6 py-4 font-semibold">Valor Total</th>
                <th className="px-6 py-4 font-semibold">Entrada</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Orçamento</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Nenhum pedido encontrado com o status selecionado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-gray-900">{order.clientName}</div>
                    {getSourceBadge(order.source)}
                  </div>
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
                  {isVisible ? formatCurrency(order.value) : 'R$ •••••'}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {order.downPayment ? (isVisible ? formatCurrency(order.downPayment) : 'R$ •••••') : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
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
                  <div className="flex items-center justify-end gap-2">
                    {onPrint && (
                      <button onClick={() => onPrint(order)} className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors" title="Imprimir Ficha">
                        <Printer className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => onEdit(order)} className="p-1.5 text-gray-400 hover:text-sky-500 transition-colors" title="Editar">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
