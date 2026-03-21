import React, { useState } from 'react';
import { Plus, Trash2, FileText, CheckCircle, Printer, Upload, Settings, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { formatCurrency, isValidDocument } from '../utils';
import { Order, Product } from '../types';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteGeneratorProps {
  onCreateOrder: (prefilledData: Partial<Order>) => void;
  products?: Product[];
}

export function QuoteGenerator({ onCreateOrder, products = [] }: QuoteGeneratorProps) {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [theme, setTheme] = useState('');

  const [items, setItems] = useState<QuoteItem[]>([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [notes, setNotes] = useState('');
  
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

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCep = e.target.value;
    setZipCode(newCep);
    
    const cleanCep = newCep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setAddress(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
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
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const updateItemFields = (id: string, updates: Partial<QuoteItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
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
    if (quoteNumber) generatedNotes += `Nº Orçamento: ${quoteNumber}\n`;
    if (clientDocument) generatedNotes += `CPF/CNPJ: ${clientDocument}\n`;
    if (clientPhone) generatedNotes += `Telefone: ${clientPhone}\n`;
    if (theme) generatedNotes += `Tema/Empresa: ${theme}\n`;
    generatedNotes += `\nEndereço de Entrega:\n${address}, ${addressNumber} - ${neighborhood}\nCEP: ${zipCode} - ${city}/${state}\n\n`;
    
    items.forEach(i => {
      generatedNotes += `- ${i.quantity}x ${i.description} (${formatCurrency(i.unitPrice)} un) = ${formatCurrency(i.quantity * i.unitPrice)}\n`;
    });
    generatedNotes += `Subtotal: ${formatCurrency(subtotal)}\n`;
    if (discount > 0) generatedNotes += `Desconto: -${formatCurrency(discount)}\n`;
    if (shipping > 0) generatedNotes += `Frete: ${formatCurrency(shipping)}\n`;
    generatedNotes += `Total Final: ${formatCurrency(total)}\n`;
    if (downPayment > 0) generatedNotes += `Entrada Sugerida: ${formatCurrency(downPayment)}\n`;
    if (notes) generatedNotes += `\nObservações: ${notes}`;

    onCreateOrder({
      clientName,
      product: productDescription,
      value: total,
      downPayment: downPayment,
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
                    className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-1 bg-white ${
                      company.document.replace(/\D/g, '').length > 0 && !isValidDocument(company.document)
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:border-sky-400 focus:ring-sky-400'
                    }`}
                  />
                  {company.document.replace(/\D/g, '').length > 0 && !isValidDocument(company.document) && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> CPF ou CNPJ inválido
                    </p>
                  )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Orçamento</label>
                <input
                  type="text"
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                  placeholder="Ex: 001/2026"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={clientDocument}
                  onChange={(e) => setClientDocument(e.target.value)}
                  placeholder="000.000.000-00"
                  className={`w-full rounded-lg border px-4 py-2 outline-none focus:ring-1 ${
                    clientDocument.replace(/\D/g, '').length > 0 && !isValidDocument(clientDocument)
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:border-sky-400 focus:ring-sky-400'
                  }`}
                />
                {clientDocument.replace(/\D/g, '').length > 0 && !isValidDocument(clientDocument) && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Documento inválido
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Endereço de Entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema ou Empresa</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Festa Infantil, Casamento, Nome da Empresa"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
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
                    <div className="flex-1 w-full relative">
                      <label className="block sm:hidden text-xs text-gray-500 mb-1">Produto/Serviço</label>
                      <input
                        type="text"
                        list={`products-list-${item.id}`}
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          
                          // Auto-fill price if a product is selected
                          const selectedProduct = products.find(p => 
                            p.description === val || 
                            (p.code && `${p.code} - ${p.description}` === val)
                          );
                          
                          if (selectedProduct) {
                            const newDescription = val === `${selectedProduct.code} - ${selectedProduct.description}` 
                              ? selectedProduct.description 
                              : val;
                              
                            updateItemFields(item.id, {
                              description: newDescription,
                              unitPrice: selectedProduct.price
                            });
                          } else {
                            updateItem(item.id, 'description', val);
                          }
                        }}
                        placeholder="Selecione ou digite o produto/serviço"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                      />
                      <datalist id={`products-list-${item.id}`}>
                        {products.map(p => (
                          <option key={p.id} value={p.code ? `${p.code} - ${p.description}` : p.description}>
                            {formatCurrency(p.price)}
                          </option>
                        ))}
                      </datalist>
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
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Entrada Sugerida (R$)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
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
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-light text-gray-800">ORÇAMENTO</h2>
            {quoteNumber && <p className="text-lg font-medium text-gray-600">Nº {quoteNumber}</p>}
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
              <p className="text-lg font-medium text-gray-900">{clientName || 'Cliente não informado'}</p>
              {clientDocument && <p className="text-gray-600 mt-1">CPF/CNPJ: {clientDocument}</p>}
              {clientPhone && <p className="text-gray-600 mt-1">Tel: {clientPhone}</p>}
              {theme && <p className="text-gray-600 mt-1">Tema/Empresa: {theme}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Endereço de Entrega</p>
              <p className="text-gray-900">{address}{addressNumber ? `, ${addressNumber}` : ''}</p>
              <p className="text-gray-900">{neighborhood}</p>
              <p className="text-gray-900">{city}{state ? ` - ${state}` : ''}</p>
              <p className="text-gray-900">{zipCode}</p>
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
            {downPayment > 0 && (
              <div className="flex justify-between text-gray-600 pt-2">
                <span>Entrada Sugerida</span>
                <span className="font-medium text-sky-600">{formatCurrency(downPayment)}</span>
              </div>
            )}
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
