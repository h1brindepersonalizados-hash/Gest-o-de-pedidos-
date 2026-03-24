import React, { useState } from 'react';
import { Quote } from '../types';
import { FileText, Search, Trash2, Edit2, Calendar, User, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedQuotesProps {
  quotes: Quote[];
  onEditQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
}

export function SavedQuotes({ quotes, onEditQuote, onDeleteQuote }: SavedQuotesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  const filteredQuotes = quotes.filter(quote => 
    quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.quoteNumber.includes(searchQuery) ||
    quote.theme.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold text-gray-800">Orçamentos Salvos</h2>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar orçamentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
        </div>
      </div>

      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum orçamento encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Tente buscar com outros termos.' : 'Você ainda não salvou nenhum orçamento.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-md">
                    #{quote.quoteNumber}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {format(parseISO(quote.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{quote.clientName}</p>
                      {quote.theme && <p className="text-xs text-gray-500 line-clamp-1">Tema: {quote.theme}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(quote.total)}</p>
                      <p className="text-xs text-gray-500">{quote.items.length} item(ns)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => setQuoteToDelete(quote.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditQuote(quote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Abrir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Orçamento</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteQuote(quoteToDelete);
                  setQuoteToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
