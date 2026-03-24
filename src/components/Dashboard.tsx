import React from 'react';
import { Order } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, Clock, AlertCircle, CalendarDays, DollarSign } from 'lucide-react';
import { isBefore, startOfDay, parseISO, isSameDay, isSameMonth } from 'date-fns';
import { useValueVisibility } from '../contexts/ValueVisibilityContext';

interface DashboardProps {
  orders: Order[];
  currentDate: Date;
}

export function Dashboard({ orders, currentDate }: DashboardProps) {
  const { isVisible } = useValueVisibility();
  
  const monthOrders = orders.filter((o) =>
    isSameMonth(parseISO(o.deliveryDate), currentDate)
  );

  const totalSales = monthOrders.reduce((acc, curr) => acc + curr.value, 0);
  const totalDownPayments = monthOrders.reduce((acc, curr) => acc + (curr.downPayment || 0), 0);
  
  const today = startOfDay(new Date());

  const delayedCount = orders.filter(
    (o) =>
      o.status !== 'concluido' &&
      isBefore(startOfDay(parseISO(o.deliveryDate)), today)
  ).length;

  const todayCount = orders.filter(
    (o) => o.status !== 'concluido' && isSameDay(startOfDay(parseISO(o.deliveryDate)), today)
  ).length;

  const inProductionCount = orders.filter((o) => o.status === 'em_producao').length;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="mb-2 flex items-center gap-2 text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Vendas no Mês</span>
        </div>
        <p className="text-2xl font-bold text-pink-600">
          {isVisible ? formatCurrency(totalSales) : 'R$ •••••'}
        </p>
      </div>

      <div className="rounded-2xl bg-sky-50 p-4 shadow-sm border border-sky-100">
        <div className="mb-2 flex items-center gap-2 text-sky-600">
          <DollarSign className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Entradas</span>
        </div>
        <p className="text-2xl font-bold text-sky-700">
          {isVisible ? formatCurrency(totalDownPayments) : 'R$ •••••'}
        </p>
      </div>

      <div className="rounded-2xl bg-red-50 p-4 shadow-sm border border-red-100">
        <div className="mb-2 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Atrasados</span>
        </div>
        <p className="text-2xl font-bold text-red-700">{delayedCount}</p>
      </div>

      <div className="rounded-2xl bg-orange-50 p-4 shadow-sm border border-orange-100">
        <div className="mb-2 flex items-center gap-2 text-orange-600">
          <CalendarDays className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Entregar Hoje</span>
        </div>
        <p className="text-2xl font-bold text-orange-700">{todayCount}</p>
      </div>

      <div className="rounded-2xl bg-blue-50 p-4 shadow-sm border border-blue-100">
        <div className="mb-2 flex items-center gap-2 text-blue-600">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Em Produção</span>
        </div>
        <p className="text-2xl font-bold text-blue-700">{inProductionCount}</p>
      </div>
    </div>
  );
}
