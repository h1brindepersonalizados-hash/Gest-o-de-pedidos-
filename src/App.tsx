import React, { useState, useMemo } from 'react';
import { useOrders } from './hooks/useOrders';
import { useProducts } from './hooks/useProducts';
import { Calendar } from './components/Calendar';
import { Dashboard } from './components/Dashboard';
import { OrderModal } from './components/OrderModal';
import { DayOrdersModal } from './components/DayOrdersModal';
import { OrderList } from './components/OrderList';
import { QuoteGenerator } from './components/QuoteGenerator';
import { ProductList } from './components/ProductList';
import { Reports } from './components/Reports';
import { SettingsView } from './components/SettingsView';
import { OrderPrintView } from './components/OrderPrintView';
import { Order } from './types';
import { addMonths, subMonths, format, parseISO, isBefore, startOfDay, isSameDay } from 'date-fns';
import { Plus, Search, Package2, LayoutDashboard, AlertTriangle, Clock, CalendarDays, Menu, X, Calculator, Send, Download, Package, FileSpreadsheet, Settings } from 'lucide-react';

type ViewMode = 'dashboard' | 'today' | 'production' | 'delayed' | 'search' | 'quote-generator' | 'sent' | 'products' | 'reports' | 'settings';

export default function App() {
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [prefilledOrderData, setPrefilledOrderData] = useState<Partial<Order> | null>(null);
  const [selectedDateForNewOrder, setSelectedDateForNewOrder] = useState<string | undefined>();
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [printViewContent, setPrintViewContent] = useState<React.ReactNode | null>(null);

  const handlePrintOrder = (order: Order) => {
    setPrintViewContent(<OrderPrintView order={order} />);
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
  };

  const handleSaveOrder = (orderData: Omit<Order, 'id'> | Order) => {
    if ('id' in orderData) {
      updateOrder(orderData.id, orderData);
    } else {
      addOrder(orderData);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setPrefilledOrderData(null);
    setIsOrderModalOpen(true);
  };

  const handleAddOrderForDay = (dateStr?: string) => {
    setSelectedDateForNewOrder(dateStr);
    setEditingOrder(null);
    setPrefilledOrderData(null);
    setIsOrderModalOpen(true);
  };

  const handleCreateOrderFromQuote = (quoteData: Partial<Order>) => {
    setEditingOrder(null);
    setPrefilledOrderData(quoteData);
    setSelectedDateForNewOrder(undefined);
    setIsOrderModalOpen(true);
  };

  const today = startOfDay(new Date());

  const delayedOrders = useMemo(() => orders.filter(
    (o) => o.status !== 'concluido' && isBefore(startOfDay(parseISO(o.deliveryDate)), today)
  ), [orders, today]);

  const todayOrders = useMemo(() => orders.filter(
    (o) => o.status !== 'concluido' && isSameDay(startOfDay(parseISO(o.deliveryDate)), today)
  ), [orders, today]);

  const productionOrders = useMemo(() => orders.filter(
    (o) => o.status === 'em_producao' || o.status === 'aguardando_arte' || o.status === 'imprimir' || o.status === 'costura'
  ), [orders]);

  const sentOrders = useMemo(() => orders.filter(
    (o) => o.status === 'enviado'
  ), [orders]);

  const handleDownloadSentOrders = () => {
    const csvContent = [
      ['Data Costureira', 'Data Envio', 'Cliente', 'Produto', 'Valor Total', 'Entrada', 'Status', 'Observacoes'].join(','),
      ...sentOrders.map(o => [
        o.seamstressDate || '',
        o.deliveryDate,
        `"${o.clientName}"`,
        `"${o.product}"`,
        o.value,
        o.downPayment || 0,
        o.status,
        `"${o.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_enviados_${format(new Date(), 'yyyy_MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.clientName.toLowerCase().includes(query) ||
        o.product.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const selectedDayOrders = useMemo(() => {
    if (!selectedDay) return [];
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    return orders.filter((o) => o.deliveryDate === dateStr);
  }, [orders, selectedDay]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      setViewMode('search');
    } else {
      setViewMode('dashboard');
    }
  };

  const NavItem = ({ icon: Icon, label, mode, count }: { icon: any, label: string, mode: ViewMode, count?: number }) => (
    <button
      onClick={() => { setViewMode(mode); setIsSidebarOpen(false); setSearchQuery(''); }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
        viewMode === mode && !searchQuery
          ? 'bg-sky-100 text-sky-700 font-medium'
          : 'text-gray-600 hover:bg-sky-50 hover:text-pink-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${viewMode === mode && !searchQuery ? 'text-sky-600' : 'text-gray-400'}`} />
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          mode === 'delayed' ? 'bg-red-100 text-red-700' : 
          mode === 'today' ? 'bg-orange-100 text-orange-700' : 
          'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col md:flex-row font-sans print:bg-white print:block print:h-auto print:min-h-0">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-sky-400 p-1.5 text-white">
            <Package2 className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold text-pink-600">Gestão de Pedidos</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 print:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center gap-2 px-6 py-6">
            <div className="rounded-xl bg-sky-400 p-2 text-white shadow-sm">
              <Package2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-pink-600 tracking-tight">Gestão de Pedidos</h1>
          </div>

          <div className="px-4 py-2">
            <button
              onClick={() => handleAddOrderForDay()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Novo Pedido
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <NavItem icon={LayoutDashboard} label="Visão Geral" mode="dashboard" />
            <NavItem icon={Calculator} label="Gerador de Orçamento" mode="quote-generator" />
            <NavItem icon={Package} label="Produtos" mode="products" />
            <NavItem icon={FileSpreadsheet} label="Relatórios" mode="reports" />
            <NavItem icon={Settings} label="Configurações" mode="settings" />
            <NavItem icon={CalendarDays} label="Entregar Hoje" mode="today" count={todayOrders.length} />
            <NavItem icon={Clock} label="Em Produção" mode="production" count={productionOrders.length} />
            <NavItem icon={Send} label="Enviados" mode="sent" count={sentOrders.length} />
            <NavItem icon={AlertTriangle} label="Atrasados" mode="delayed" count={delayedOrders.length} />
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:block print:h-auto">
        {/* Delay Warning Banner */}
        {delayedOrders.length > 0 && (
          <div className="bg-red-600 px-4 py-3 text-white sm:px-6 lg:px-8 flex items-center justify-between shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-medium">
                Atenção: Você tem {delayedOrders.length} pedido(s) atrasado(s)!
              </p>
            </div>
            <button 
              onClick={() => { setViewMode('delayed'); setSearchQuery(''); }} 
              className="text-sm font-bold underline hover:text-red-100 whitespace-nowrap ml-4"
            >
              Ver pedidos
            </button>
          </div>
        )}

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8 shrink-0 print:hidden">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-pink-600 hidden sm:block capitalize">
              {viewMode === 'dashboard' ? 'Visão Geral' : 
               viewMode === 'quote-generator' ? 'Gerador de Orçamento' :
               viewMode === 'products' ? 'Produtos' :
               viewMode === 'reports' ? 'Relatórios' :
               viewMode === 'settings' ? 'Configurações' :
               viewMode === 'today' ? 'Entregar Hoje' : 
               viewMode === 'production' ? 'Em Produção' : 
               viewMode === 'sent' ? 'Pedidos Enviados' :
               viewMode === 'delayed' ? 'Pedidos Atrasados' : 'Resultados da Busca'}
            </h2>
            <div className="relative w-full sm:max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar cliente ou produto..."
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full rounded-full border-0 py-2 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-400 sm:text-sm sm:leading-6 bg-sky-50"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0 print:bg-white print:block print:h-auto">
          <div className="max-w-5xl mx-auto space-y-6 print:max-w-none print:m-0 print:space-y-0">
            {viewMode === 'search' ? (
              <OrderList 
                orders={searchResults} 
                onEdit={handleEditOrder} 
                onDelete={deleteOrder}
                onPrint={handlePrintOrder}
                emptyMessage={`Nenhum pedido encontrado para "${searchQuery}"`}
              />
            ) : viewMode === 'quote-generator' ? (
              <QuoteGenerator 
                onCreateOrder={handleCreateOrderFromQuote} 
                products={products} 
                onPreview={setPrintViewContent} 
                onBack={() => setViewMode('dashboard')} 
              />
            ) : viewMode === 'products' ? (
              <ProductList 
                products={products}
                onAdd={addProduct}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
              />
            ) : viewMode === 'reports' ? (
              <Reports orders={orders} />
            ) : viewMode === 'settings' ? (
              <SettingsView />
            ) : viewMode === 'today' ? (
              <OrderList 
                orders={todayOrders} 
                onEdit={handleEditOrder} 
                onDelete={deleteOrder}
                onPrint={handlePrintOrder}
                emptyMessage="Nenhum pedido para entregar hoje. Bom trabalho!"
              />
            ) : viewMode === 'production' ? (
              <OrderList 
                orders={productionOrders} 
                onEdit={handleEditOrder} 
                onDelete={deleteOrder}
                onPrint={handlePrintOrder}
                emptyMessage="Nenhum pedido em produção no momento."
              />
            ) : viewMode === 'sent' ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleDownloadSentOrders}
                    className="flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-200"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Relatório (CSV)
                  </button>
                </div>
                <OrderList 
                  orders={sentOrders} 
                  onEdit={handleEditOrder} 
                  onDelete={deleteOrder}
                  onPrint={handlePrintOrder}
                  emptyMessage="Nenhum pedido enviado no momento."
                />
              </div>
            ) : viewMode === 'delayed' ? (
              <OrderList 
                orders={delayedOrders} 
                onEdit={handleEditOrder} 
                onDelete={deleteOrder}
                onPrint={handlePrintOrder}
                emptyMessage="Nenhum pedido atrasado. Excelente!"
              />
            ) : (
              <>
                <Dashboard orders={orders} currentDate={currentDate} />
                <Calendar
                  currentDate={currentDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  orders={orders}
                  onDayClick={handleDayClick}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        initialData={editingOrder}
        prefilledData={prefilledOrderData}
        selectedDate={selectedDateForNewOrder}
        products={products}
      />

      <DayOrdersModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        date={selectedDay}
        orders={selectedDayOrders}
        onEdit={handleEditOrder}
        onDelete={deleteOrder}
        onAddOrder={handleAddOrderForDay}
        onPrint={handlePrintOrder}
      />

      {/* Print View Container */}
      {printViewContent && (
        <div className="fixed inset-0 z-[100] bg-white print:static print:inset-auto print:bg-transparent">
          <div className="h-full overflow-auto print:h-auto print:overflow-visible">
            <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none print:w-full print:m-0">
              <div className="flex items-center justify-between mb-8 print:hidden">
                <p className="text-sm text-gray-500">
                  Dica: Se a impressão não abrir, tente abrir o aplicativo em uma nova aba.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600"
                  >
                    Imprimir
                  </button>
                  <button
                    onClick={() => setPrintViewContent(null)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
              <div className="print:w-full">
                {printViewContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
