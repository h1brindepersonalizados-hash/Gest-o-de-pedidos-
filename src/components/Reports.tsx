import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { Download, FileSpreadsheet } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils';

interface ReportsProps {
  orders: Order[];
}

export function Reports({ orders }: ReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const date = parseISO(order.deliveryDate);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [orders, selectedMonth, selectedYear]);

  const totalSales = filteredOrders.reduce((acc, curr) => acc + curr.value, 0);
  const totalDownPayments = filteredOrders.reduce((acc, curr) => acc + (curr.downPayment || 0), 0);
  const totalPending = totalSales - totalDownPayments;

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Data de Entrega', 'Cliente', 'Produto', 'Valor Total', 'Entrada', 'Restante', 'Status', 'Observacoes'].join(','),
      ...filteredOrders.map(o => [
        format(parseISO(o.deliveryDate), 'dd/MM/yyyy'),
        `"${o.clientName}"`,
        `"${o.product}"`,
        o.value,
        o.downPayment || 0,
        o.value - (o.downPayment || 0),
        o.status,
        `"${o.notes ? o.notes.replace(/\n/g, ' ') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${format(new Date(selectedYear, selectedMonth), 'MMMM_yyyy', { locale: ptBR })}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllCSV = () => {
    const csvContent = [
      ['Data de Entrega', 'Cliente', 'Produto', 'Valor Total', 'Entrada', 'Restante', 'Status', 'Observacoes'].join(','),
      ...orders.map(o => [
        format(parseISO(o.deliveryDate), 'dd/MM/yyyy'),
        `"${o.clientName}"`,
        `"${o.product}"`,
        o.value,
        o.downPayment || 0,
        o.value - (o.downPayment || 0),
        o.status,
        `"${o.notes ? o.notes.replace(/\n/g, ' ') : ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_todos_pedidos.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    return format(new Date(2000, i, 1), 'MMMM', { locale: ptBR });
  });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Relatório Financeiro</h2>
              <p className="text-sm text-gray-500">Acompanhe as vendas e entradas do mês</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 capitalize"
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Total em Vendas</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm font-medium text-emerald-600 mb-1">Total de Entradas Recebidas</p>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalDownPayments)}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <p className="text-sm font-medium text-orange-600 mb-1">A Receber (Restante)</p>
            <p className="text-2xl font-bold text-orange-700">{formatCurrency(totalPending)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            <Download className="h-5 w-5" />
            Baixar Relatório do Mês (CSV)
          </button>
          <button
            onClick={handleDownloadAllCSV}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-900 transition-colors"
          >
            <Download className="h-5 w-5" />
            Baixar Todos os Pedidos (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
