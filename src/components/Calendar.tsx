import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  addDays,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Order } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils';

interface CalendarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  orders: Order[];
  onDayClick: (date: Date) => void;
}

export function Calendar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  orders,
  onDayClick,
}: CalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = 'MMMM yyyy';
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDayStatus = (date: Date) => {
    const dayOrders = orders.filter((o) => o.deliveryDate === format(date, 'yyyy-MM-dd'));
    if (dayOrders.length === 0) return null;

    const hasDelayed = dayOrders.some(
      (o) =>
        o.status !== 'concluido' &&
        isBefore(startOfDay(parseISO(o.deliveryDate)), startOfDay(new Date()))
    );

    if (hasDelayed) return 'delayed';

    const hasNearDeadline = dayOrders.some((o) => {
      if (o.status === 'concluido') return false;
      const delivery = startOfDay(parseISO(o.deliveryDate));
      const today = startOfDay(new Date());
      return isSameDay(delivery, today) || isSameDay(delivery, addDays(today, 1)) || isSameDay(delivery, addDays(today, 2));
    });

    if (hasNearDeadline) return 'near';

    const allCompleted = dayOrders.every((o) => o.status === 'concluido');
    if (allCompleted) return 'completed';

    return 'pending';
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold capitalize text-pink-600">
          {format(currentDate, dateFormat, { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            {day}
          </div>
        ))}

        {days.map((day, i) => {
          const status = getDayStatus(day);
          const dayOrders = orders.filter((o) => o.deliveryDate === format(day, 'yyyy-MM-dd'));

          return (
            <div
              key={day.toString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border p-1 transition-all hover:scale-105 bg-white',
                !isSameMonth(day, monthStart)
                  ? 'border-transparent text-gray-300'
                  : 'border-gray-100 text-gray-700 hover:border-sky-200 hover:shadow-sm',
                isToday(day) && 'bg-sky-50 font-bold text-sky-700',
                status === 'delayed' && 'border-red-300',
                status === 'near' && 'border-yellow-300',
                status === 'completed' && 'border-green-300',
                status === 'pending' && 'border-blue-300'
              )}
            >
              <span className="text-sm sm:text-base">{format(day, 'd')}</span>
              
              {dayOrders.length > 0 && (
                <div className="mt-1 flex gap-0.5">
                  {dayOrders.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        status === 'delayed' && 'bg-red-500',
                        status === 'near' && 'bg-yellow-500',
                        status === 'completed' && 'bg-green-500',
                        status === 'pending' && 'bg-blue-500'
                      )}
                    />
                  ))}
                  {dayOrders.length > 3 && (
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" /> Atrasados
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-yellow-500" /> Próximos (3 dias)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-blue-500" /> Pendentes
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-green-500" /> Concluídos
        </div>
      </div>
    </div>
  );
}
