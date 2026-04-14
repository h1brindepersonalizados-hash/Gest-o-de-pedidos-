import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Order } from '../types';
import { addDays, format } from 'date-fns';

interface ImportOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (orders: Omit<Order, 'id' | 'createdAt'>[]) => void;
}

type Platform = 'shopee' | 'elo7';

export function ImportOrdersModal({ isOpen, onClose, onImport }: ImportOrdersModalProps) {
  const [platform, setPlatform] = useState<Platform>('shopee');
  const [file, setFile] = useState<File | null>(null);
  const [parsedOrders, setParsedOrders] = useState<Omit<Order, 'id' | 'createdAt'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const parseCurrency = (val: string) => {
    if (!val) return 0;
    const cleaned = val.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setParsedOrders([]);
    }
  };

  const handleParse = () => {
    if (!file) return;
    setIsParsing(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          const newOrders: Omit<Order, 'id' | 'createdAt'>[] = [];

          // Data padrão de entrega: 7 dias a partir de hoje
          const defaultDeliveryDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');

          rows.forEach((row, index) => {
            let clientName = '';
            let product = '';
            let value = 0;
            let notes = '';

            if (platform === 'shopee') {
              clientName = row['Nome de usuário (Comprador)'] || row['Nome do Destinatário'] || 'Cliente Shopee';
              product = row['Nome do Produto'] || row['Número de Referência do SKU'] || 'Produto Shopee';
              value = parseCurrency(row['Preço Total'] || row['Total do Pedido'] || '0');
              notes = `Pedido Shopee: ${row['Nº do pedido'] || 'N/A'}`;
            } else if (platform === 'elo7') {
              clientName = row['Comprador'] || row['Nome'] || 'Cliente Elo7';
              product = row['Produto'] || row['Produtos'] || row['Título'] || 'Produto Elo7';
              value = parseCurrency(row['Total'] || row['Valor Total'] || '0');
              notes = `Pedido Elo7: ${row['Pedido'] || 'N/A'}`;
            }

            // Ignorar linhas completamente vazias que o papaparse possa ter deixado passar
            if (clientName === `Cliente ${platform === 'shopee' ? 'Shopee' : 'Elo7'}` && value === 0 && (!row['Nº do pedido'] && !row['Pedido'])) {
              return;
            }

            newOrders.push({
              clientName,
              product,
              value,
              status: 'pendente',
              source: platform,
              deliveryDate: defaultDeliveryDate,
              notes,
            });
          });

          if (newOrders.length === 0) {
            setError('Nenhum pedido válido encontrado na planilha. Verifique se escolheu a plataforma correta.');
          } else {
            setParsedOrders(newOrders);
          }
        } catch (err) {
          console.error(err);
          setError('Erro ao processar a planilha. Verifique o formato do arquivo.');
        } finally {
          setIsParsing(false);
        }
      },
      error: (error) => {
        console.error(error);
        setError('Erro ao ler o arquivo CSV.');
        setIsParsing(false);
      }
    });
  };

  const handleImport = () => {
    if (parsedOrders.length > 0) {
      onImport(parsedOrders);
      onClose();
      // Reset state
      setFile(null);
      setParsedOrders([]);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 p-2 text-sky-600">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Importar Planilha</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Plataforma de Origem</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setPlatform('shopee'); setParsedOrders([]); setError(null); }}
                className={`rounded-xl border-2 p-4 text-center transition-colors ${
                  platform === 'shopee'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <span className="font-bold">Shopee</span>
              </button>
              <button
                type="button"
                onClick={() => { setPlatform('elo7'); setParsedOrders([]); setError(null); }}
                className={`rounded-xl border-2 p-4 text-center transition-colors ${
                  platform === 'elo7'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 hover:border-yellow-200'
                }`}
              >
                <span className="font-bold">Elo7</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Arquivo CSV</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-sky-400 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 mt-4 justify-center">
                  <label className="relative cursor-pointer rounded-md bg-white font-medium text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 hover:text-sky-500">
                    <span>{file ? file.name : 'Selecionar arquivo CSV'}</span>
                    <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Apenas arquivos .csv exportados da plataforma</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Preview */}
          {parsedOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Pré-visualização ({parsedOrders.length} pedidos encontrados)
              </h3>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Cliente</th>
                      <th className="px-4 py-2 font-semibold">Produto</th>
                      <th className="px-4 py-2 font-semibold text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedOrders.slice(0, 50).map((order, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900 truncate max-w-[150px]">{order.clientName}</td>
                        <td className="px-4 py-2 truncate max-w-[200px]">{order.product}</td>
                        <td className="px-4 py-2 text-right">R$ {order.value.toFixed(2).replace('.', ',')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedOrders.length > 50 && (
                  <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                    Mostrando os primeiros 50 pedidos...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-6 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          
          {parsedOrders.length === 0 ? (
            <button
              onClick={handleParse}
              disabled={!file || isParsing}
              className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? 'Processando...' : 'Analisar Planilha'}
            </button>
          ) : (
            <button
              onClick={handleImport}
              className="rounded-lg bg-green-500 px-6 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
            >
              Importar {parsedOrders.length} Pedidos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
