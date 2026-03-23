import React, { useEffect, useState } from 'react';
import { Order, CompanySettings } from '../types';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../utils';

export function OrderPrintView({ order }: { order: Order }) {
  const [company, setCompany] = useState<CompanySettings | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      setCompany(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <div className="text-gray-900 font-sans print:text-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex items-center gap-4 max-w-[60%]">
          {company?.logo && (
            <img src={company.logo} alt="Logo" className="h-20 w-auto object-contain" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{company?.name || 'Sua Empresa'}</h2>
            <div className="text-sm text-gray-600 mt-1 space-y-0.5">
              {company?.document && <p>CNPJ/CPF: {company.document}</p>}
              {company?.phone && <p>Tel: {company.phone}</p>}
              {company?.email && <p>E-mail: {company.email}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Ficha de Produção</h1>
          <p className="text-gray-500 mt-1 font-medium">PEDIDO #{order.id.slice(0, 8).toUpperCase()}</p>
          <div className="mt-4 inline-block bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data de Entrega</p>
            <p className="text-xl font-bold text-gray-900">{format(parseISO(order.deliveryDate), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
          <p className="text-lg font-bold text-gray-900">{order.clientName}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status do Pedido</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Products */}
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">Produtos / Descrição</p>
        <div className="py-2">
          <p className="text-base whitespace-pre-wrap break-words text-gray-800 leading-relaxed">{order.product}</p>
        </div>
      </div>

      {/* Value */}
      <div className="mb-6 flex justify-end">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-w-[250px] text-right">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Valor Total</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(order.value)}</p>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">Observações</p>
          <div className="py-2">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 break-words leading-relaxed">{order.notes}</pre>
          </div>
        </div>
      )}

      {/* Artwork */}
      {order.artwork && (
        <div className="mt-8" style={{ pageBreakInside: 'avoid' }}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">Arte Anexada</p>
          <img src={order.artwork.data} alt="Arte" className="max-w-full max-h-[8cm] rounded-lg border border-gray-200 object-contain mt-4" />
        </div>
      )}
    </div>
  );
}
