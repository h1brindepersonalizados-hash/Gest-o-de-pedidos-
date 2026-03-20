import React, { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle, Printer, Upload, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../utils';
import { Order } from '../types';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteGeneratorProps {
  onCreateOrder: (prefilledData: Partial<Order>) => void;
}

export function QuoteGenerator({ onCreateOrder }: QuoteGeneratorProps) {
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState(15);
  
  const [showSettings, setShowSettings] = useState(false);
  const [company, setCompany] = useState({
    name: 'H1 Brindes Personalizados',
    document: '',
    phone: '',
    email: 'h1brindepersonalizados@gmail.com',
    logo: ''
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompany({ ...company, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const total = Math.max(0, subtotal - discount) + shipping;

  const handleGenerateOrder = () => {
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    if (items.some(i => !i.description.trim())) {
      alert('Por favor, preencha a descrição de todos os itens.');
      return;
    }

    const productDescription = items.map(i => `${i.quantity}x ${i.description}`).join(', ');
    
    let generatedNotes = `--- ORÇAMENTO APROVADO ---\n`;
    generatedNotes += `Validade original: ${validityDays} dias\n`;
    items.forEach(i => {
      generatedNotes += `- ${i.quantity}x ${i.description} (${formatCurrency(i.unitPrice)} un) = ${formatCurrency(i.quantity * i.unitPrice)}\n`;
    });
    generatedNotes += `Subtotal: ${formatCurrency(subtotal)}\n`;
    if (discount > 0) generatedNotes += `Desconto: -${formatCurrency(discount)}\n`;
    if (shipping > 0) generatedNotes += `Frete: ${formatCurrency(shipping)}\n`;
    generatedNotes += `Total Final: ${formatCurrency(total)}\n`;
    if (notes) generatedNotes += `\nObservações: ${notes}`;

    onCreateOrder({
      clientName,
      product: productDescription,
      value: total,
      notes: generatedNotes,
      status: 'pendente'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full">
      {/* --- FORMULÁRIO (Oculto na impressão) --- */}
      <div className="max-w-4xl mx-auto space-y-6 print:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 p-3 rounded-xl text-sky-500">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-pink-600">Gerador de Orçamento</h2>
                <p className="text-sm text-gray-500">Crie orçamentos detalhados e converta-os em pedidos rapidamente.</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-sky-500 transition-colors bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
            >
              <Settings className="h-4 w-4" />
              Configurar Cabeçalho
              {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Configurações da Empresa */}
          {showSettings && (
            <div className="mb-8 bg-sky-50/50 p-6 rounded-xl border border-sky-100 space-y-4">
              <h3 className="text-sm font-semibold text-pink-600 uppercase tracking-wider">Dados da Sua Empresa (Para o PDF/Impressão)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={company.document}
                    onChange={(e) => setCompany({ ...company, document: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logotipo</label>
                  <div className="flex items-center gap-4">
                    {company.logo && (
                      <img src={company.logo} alt="Logo" className="h-12 w-12 object-contain rounded border border-gray-200 bg-white" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                      <Upload className="h-4 w-4" />
                      {company.logo ? 'Trocar Logo' : 'Fazer Upload da Logo'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {company.logo && (
                      <button onClick={() => setCompany({ ...company, logo: '' })} className="text-sm text-red-600 hover:text-red-800">
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Maria Oliveira"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias)</label>
                <input
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Itens do Orçamento</label>
                <button 
                  onClick={addItem}
                  className="text-sm text-sky-500 font-medium hover:text-sky-600 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Adicionar Item
                </button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-full sm:w-16">
                      <label className="block sm:hidden text-xs text-gray-500 mb-1">Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-center"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block sm:hidden text-xs text-gray-500 mb-1">Descrição</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descrição do produto/serviço"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="block sm:hidden text-xs text-gray-500 mb-1">Valor Unit. (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                      />
                    </div>
                    <div className="w-full sm:w-32 flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Orçamento</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="Condições de pagamento, prazos específicos, etc."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Desconto (R$)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-right outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Frete (R$)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-right outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Total Final</span>
                  <span className="text-xl font-bold text-sky-500">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-100">
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 shadow-sm"
              >
                <Printer className="h-5 w-5" />
                Visualizar / Imprimir PDF
              </button>
              <button 
                onClick={handleGenerateOrder}
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-6 py-3 font-medium text-white transition-colors hover:bg-sky-500 shadow-sm"
              >
                <CheckCircle className="h-5 w-5" />
                Aprovar e Criar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- VISUALIZAÇÃO DE IMPRESSÃO (Visível apenas na impressão) --- */}
      <div className="hidden print:block bg-white w-full text-gray-900 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
          <div className="max-w-[50%]">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="max-h-24 object-contain" />
            ) : (
              <div className="h-24 w-48 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-medium rounded-lg">
                Sua Logo Aqui
              </div>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            {company.document && <p className="text-gray-600 mt-1">CNPJ/CPF: {company.document}</p>}
            {company.phone && <p className="text-gray-600">{company.phone}</p>}
            {company.email && <p className="text-gray-600">{company.email}</p>}
          </div>
        </div>

        {/* Info */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-gray-800 mb-6">ORÇAMENTO</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
              <p className="text-lg font-medium text-gray-900">{clientName || 'Cliente não informado'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Data e Validade</p>
              <p className="text-gray-900">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              <p className="text-gray-900">Válido por: {validityDays} dias</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-8 text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 font-bold text-gray-700">Descrição</th>
              <th className="py-3 font-bold text-gray-700 text-center">Qtd</th>
              <th className="py-3 font-bold text-gray-700 text-right">V. Unitário</th>
              <th className="py-3 font-bold text-gray-700 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 text-gray-800">{item.description || '-'}</td>
                <td className="py-4 text-gray-800 text-center">{item.quantity}</td>
                <td className="py-4 text-gray-800 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 text-gray-800 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Desconto</span>
                <span className="text-red-600">-{formatCurrency(discount)}</span>
              </div>
            )}
            {shipping > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Frete</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-200">
              <span>Total Final</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Observações</p>
            <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
