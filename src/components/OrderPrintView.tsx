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
    <div className="text-gray-900">
      {/* Company Header */}
      {company && (
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-6">
          <div className="flex items-center gap-4">
            {company.logo && (
              <img src={company.logo} alt="Logo" className="h-16 w-auto object-contain" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
              <div className="text-sm text-gray-500 mt-1">
                {company.document && <span>{company.document}</span>}
                {company.document && company.phone && <span className="mx-2">•</span>}
                {company.phone && <span>{company.phone}</span>}
              </div>
              {company.email && <div className="text-sm text-gray-500">{company.email}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="border-b-2 border-gray-200 pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ficha de Produção</h1>
          <p className="text-gray-500 mt-1">Pedido #{order.id.slice(0, 8)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-500 uppercase">Data de Entrega</p>
          <p className="text-xl font-bold text-gray-900">{format(parseISO(order.deliveryDate), 'dd/MM/yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase mb-1">Cliente</p>
          <p className="text-lg font-medium">{order.clientName}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase mb-1">Status</p>
          <p className="text-lg font-medium capitalize">{order.status.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Produtos / Descrição</p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-lg whitespace-pre-wrap">{order.product}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase mb-1">Valor Total</p>
          <p className="text-xl font-bold text-sky-600">{formatCurrency(order.value)}</p>
        </div>
      </div>

      {order.notes && (
        <div className="mb-8">
          <p className="text-sm font-bold text-gray-500 uppercase mb-2">Observações</p>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <pre className="whitespace-pre-wrap font-sans text-gray-800">{order.notes}</pre>
          </div>
        </div>
      )}

      {order.artwork && (
        <div className="mt-8" style={{ pageBreakInside: 'avoid' }}>
          <p className="text-sm font-bold text-gray-500 uppercase mb-2">Arte Anexada</p>
          <img src={order.artwork.data} alt="Arte" className="w-[7cm] h-[4cm] rounded-lg border border-gray-200 object-contain" />
        </div>
      )}
    </div>
  );
}
