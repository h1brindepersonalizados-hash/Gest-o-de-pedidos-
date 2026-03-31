import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function OrderModal({ isOpen, onClose, onSaveSuccess }: OrderModalProps) {
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [tema, setTema] = useState('');
  const [produto, setProduto] = useState('');
  const [valor, setValor] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [dataEnvio, setDataEnvio] = useState('');
  const [dataLimite, setDataLimite] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: crypto.randomUUID(), // Garante um ID único para cada novo registro (força INSERT)
      nome,
      contato,
      tema,
      produto,
      valor: parseFloat(valor) || 0,
      quantidade: parseInt(quantidade, 10) || 1,
      data_envio: dataEnvio,
      data_limite: dataLimite
    };

    try {
      const response = await fetch('https://hqvwjpqehclqrtahjqkt.supabase.co/rest/v1/pedidos', {
        method: 'POST', // POST no Supabase REST API é estritamente um INSERT
        headers: {
          'apikey': 'sb_publishable_ozWh_BdL4Wh5z1RTThCehw_qZJakgX1',
          'Authorization': 'Bearer sb_publishable_ozWh_BdL4Wh5z1RTThCehw_qZJakgX1',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Falha na requisição');
      }

      alert('Salvo com sucesso');
      
      // Limpar formulário
      setNome('');
      setContato('');
      setTema('');
      setProduto('');
      setValor('');
      setQuantidade('1');
      setDataEnvio('');
      setDataLimite('');
      
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Novo Pedido</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contato</label>
            <input type="text" required value={contato} onChange={(e) => setContato(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tema</label>
            <input type="text" required value={tema} onChange={(e) => setTema(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Produto</label>
            <input type="text" required value={produto} onChange={(e) => setProduto(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valor (R$)</label>
              <input type="number" step="0.01" required value={valor} onChange={(e) => setValor(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantidade</label>
              <input type="number" required value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data de Envio</label>
              <input type="date" required value={dataEnvio} onChange={(e) => setDataEnvio(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data Limite</label>
              <input type="date" required value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-sky-400" />
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full rounded-lg bg-sky-400 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-sky-500">
              Salvar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
