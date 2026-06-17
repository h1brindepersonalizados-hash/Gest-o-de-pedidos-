import React, { useState, useMemo } from 'react';
import { Order, Quote } from '../types';
import { Download, FileSpreadsheet, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency, exportToExcel } from '../utils';
import * as XLSX from 'xlsx';

interface ReportsProps {
  orders: Order[];
  quotes: Quote[];
}

export function Reports({ orders, quotes }: ReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const date = order.createdAt ? parseISO(order.createdAt) : parseISO(order.deliveryDate);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [orders, selectedMonth, selectedYear]);

  const totalSales = filteredOrders.reduce((acc, curr) => acc + curr.value, 0);
  const totalDownPayments = filteredOrders.reduce((acc, curr) => acc + (curr.downPayment || 0), 0);
  const totalPending = totalSales - totalDownPayments;

  const handleDownloadCSV = () => {
    const csvContent = '\uFEFF' + [
      ['Data do Pedido', 'Data de Entrega', 'Cliente', 'Produto', 'Valor Total', 'Entrada', 'Restante', 'Status', 'Observacoes'].join(';'),
      ...filteredOrders.map(o => [
        o.createdAt ? format(parseISO(o.createdAt), 'dd/MM/yyyy') : format(parseISO(o.deliveryDate), 'dd/MM/yyyy'),
        format(parseISO(o.deliveryDate), 'dd/MM/yyyy'),
        `"${o.clientName.replace(/"/g, '""')}"`,
        `"${o.product.replace(/"/g, '""')}"`,
        o.value.toFixed(2).replace('.', ','),
        (o.downPayment || 0).toFixed(2).replace('.', ','),
        (o.value - (o.downPayment || 0)).toFixed(2).replace('.', ','),
        o.status,
        `"${o.notes ? o.notes.replace(/\n/g, ' ').replace(/"/g, '""') : ''}"`
      ].join(';'))
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

  const handleExportFullData = () => {
    // 1. Prepare Orders Sheet
    const ordersData = orders.map(o => ({
      'ID': o.id,
      'Data de Criação': o.createdAt ? format(parseISO(o.createdAt), 'dd/MM/yyyy HH:mm') : '',
      'Cliente': o.clientName,
      'Telefone': o.clientPhone || '',
      'Produto': o.product,
      'Valor Total': o.value,
      'Sinal/Entrada': o.downPayment || 0,
      'Restante': o.value - (o.downPayment || 0),
      'Data de Entrega': o.deliveryDate ? format(parseISO(o.deliveryDate), 'dd/MM/yyyy') : '',
      'Status': o.status,
      'Origem': o.source || 'direta',
      'Observações': o.notes || ''
    }));

    // 2. Prepare Quotes Sheet
    const quotesData = quotes.map(q => ({
      'Número': q.quoteNumber,
      'Data': format(parseISO(q.createdAt), 'dd/MM/yyyy HH:mm'),
      'Cliente': q.clientName,
      'Documento': q.clientDocument || '',
      'Telefone': q.clientPhone || '',
      'Tema': q.theme || '',
      'Subtotal': q.subtotal,
      'Desconto': q.discount,
      'Frete': q.shipping,
      'Total': q.total,
      'Itens Qtd': q.items.reduce((acc, item) => acc + item.quantity, 0),
      'Data de Entrega': q.deliveryDate ? format(parseISO(q.deliveryDate), 'dd/MM/yyyy') : '',
      'Observações': q.notes || ''
    }));

    // 3. Prepare Clients Sheet (aggregate from orders and quotes)
    const clientsMap = new Map<string, any>();

    orders.forEach(o => {
      const key = o.clientName.trim().toLowerCase() + (o.clientPhone?.trim() || '');
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          'Nome do Cliente': o.clientName,
          'Telefone': o.clientPhone || '',
          'Total de Pedidos': 0,
          'Valor Gasto (Pedidos)': 0,
          'Total de Orçamentos': 0,
          'Valor Cotado (Orçamentos)': 0,
          'Último Pedido': null,
          'Origem Frequente': o.source || 'direta'
        });
      }
      const client = clientsMap.get(key);
      client['Total de Pedidos'] += 1;
      client['Valor Gasto (Pedidos)'] += o.value;
      
      const orderDate = o.createdAt ? parseISO(o.createdAt) : parseISO(o.deliveryDate);
      if (!client['Último Pedido'] || orderDate > client['Último Pedido']) {
        client['Último Pedido'] = orderDate;
      }
    });

    quotes.forEach(q => {
      const key = q.clientName.trim().toLowerCase() + (q.clientPhone?.trim() || '');
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          'Nome do Cliente': q.clientName,
          'Telefone': q.clientPhone || '',
          'Total de Pedidos': 0,
          'Valor Gasto (Pedidos)': 0,
          'Total de Orçamentos': 0,
          'Valor Cotado (Orçamentos)': 0,
          'Último Pedido': null,
          'Origem Frequente': 'orçamento'
        });
      }
      const client = clientsMap.get(key);
      client['Total de Orçamentos'] += 1;
      client['Valor Cotado (Orçamentos)'] += q.total;
    });

    const clientsData = Array.from(clientsMap.values()).map(c => ({
      ...c,
      'Último Pedido': c['Último Pedido'] ? format(c['Último Pedido'], 'dd/MM/yyyy') : ''
    }));

    // Export to Excel with multiple sheets
    const wb = XLSX.utils.book_new();
    
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, wsOrders, "Pedidos");

    const wsQuotes = XLSX.utils.json_to_sheet(quotesData);
    XLSX.utils.book_append_sheet(wb, wsQuotes, "Orçamentos");

    const wsClients = XLSX.utils.json_to_sheet(clientsData);
    XLSX.utils.book_append_sheet(wb, wsClients, "Clientes (CRM)");

    XLSX.writeFile(wb, `exportacao_completa_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
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
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            <Download className="h-5 w-5" />
            Baixar Relatório do Mês (CSV)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-sky-100 p-3 rounded-xl text-sky-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Exportação Completa (CRM e Integrações)</h2>
              <p className="text-sm text-gray-500">Exporte todos os seus dados para usar em outras plataformas</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6 max-w-2xl">
          Esta exportação irá gerar uma planilha (Excel) completa e estruturada contendo três abas: 
          <strong> Pedidos</strong>, <strong>Orçamentos</strong>, e uma aba unificada de <strong>Clientes</strong>. 
          Ideal para importar no seu CRM, sistema de marketing (como RD Station, Mailchimp), ou fazer backups de todos os dados do aplicativo.
        </p>

        <button
          onClick={handleExportFullData}
          className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600 transition-colors"
        >
          <FileSpreadsheet className="h-5 w-5" />
          Baixar Planilha Completa (Pedidos, Orçamentos e Clientes)
        </button>
      </div>
    </div>
  );
}
