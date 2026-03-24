import React, { useEffect, useState } from 'react';
import { Order, CompanySettings } from '../types';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../utils';
import { useValueVisibility } from '../contexts/ValueVisibilityContext';

export function OrderPrintView({ order }: { order: Order }) {
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const { isVisible } = useValueVisibility();

  useEffect(() => {
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      setCompany(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <div className="text-gray-900 font-sans print:text-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-4">
        <div className="flex items-center gap-4 max-w-[60%]">
          {company?.logo && (
            <img src={company.logo} alt="Logo" className="h-16 w-auto object-contain" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{company?.name || 'Sua Empresa'}</h2>
            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
              {company?.document && <p>CNPJ/CPF: {company.document}</p>}
              {company?.phone && <p>Tel: {company.phone}</p>}
              {company?.email && <p>E-mail: {company.email}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Ficha de Produção</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">PEDIDO #{order.id.slice(0, 8).toUpperCase()}</p>
          <div className="mt-2 inline-block bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Data de Entrega</p>
            <p className="text-lg font-bold text-gray-900">{format(parseISO(order.deliveryDate), 'dd/MM/yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
          <p className="text-base font-bold text-gray-900">{order.clientName}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status do Pedido</p>
          <p className="text-base font-bold text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Content wrapper for flex layout */}
      <div className="print:block">
        {/* Products */}
        {!order.notes?.includes('--- ORÇAMENTO APROVADO ---') && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 border-b border-gray-200 pb-1">Produtos / Descrição</p>
            <div className="py-1">
              <p className="text-sm whitespace-pre-wrap break-words text-gray-800 leading-relaxed">{order.product}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row print:flex-row gap-6 mt-4">
          {/* Left Column: Notes */}
          <div className="flex-1">
            {order.notes && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 border-b border-gray-200 pb-1">Observações</p>
                <div className="py-1">
                  <pre className="whitespace-pre-wrap font-sans text-xs text-gray-700 break-words leading-relaxed">{order.notes}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Value & Artwork */}
          <div className="w-full sm:w-48 print:w-48 shrink-0 flex flex-col gap-4">
            {/* Value */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Valor Total</p>
              <p className="text-base font-bold text-gray-900">{isVisible ? formatCurrency(order.value) : 'R$ •••••'}</p>
            </div>

            {/* Artwork */}
            {order.artwork && (
              <div style={{ pageBreakInside: 'avoid' }}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 border-b border-gray-200 pb-1 text-right">Arte Anexada</p>
                <div className="flex justify-end">
                  <img src={order.artwork.data} alt="Arte" className="print:max-h-[4cm] print:max-w-[3cm] max-h-[150px] rounded border border-gray-200 object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
