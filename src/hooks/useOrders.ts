import { useState, useEffect } from 'react';
import { Order } from '../types';

const SUPABASE_URL = 'https://hqvwjpqehclqrtahjqkt.supabase.com/rest/v1/pedidos';
const ANON_KEY = 'sb_publishable_ozWh_BdL4Wh5z1RTThCehw_qZJakgX1';

const headers = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}?select=*&order=createdAt.desc`, {
        method: 'GET',
        headers,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.statusText}`);
      }

      const data = await response.json();
      if (data) {
        setOrders(data as Order[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    const newOrder = { 
      ...order, 
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    setOrders((prev) => [newOrder, ...prev]);

    try {
      const response = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers,
        mode: 'cors',
        body: JSON.stringify(newOrder)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro detalhado do Supabase:', errorData);
        throw new Error(`Erro ao inserir pedido: ${response.statusText}`);
      }
      
      console.log('Pedido inserido com sucesso no Supabase:', newOrder);
      return newOrder;
    } catch (error) {
      console.error('Erro inesperado ao salvar pedido:', error);
      // Revert optimistic update on error
      setOrders((prev) => prev.filter(o => o.id !== newOrder.id));
      throw error;
    }
  };

  const updateOrder = async (id: string, updatedOrder: Partial<Order>) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updatedOrder } : order))
    );

    try {
      const response = await fetch(`${SUPABASE_URL}?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        mode: 'cors',
        body: JSON.stringify(updatedOrder)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro detalhado do Supabase:', errorData);
        throw new Error(`Erro ao atualizar pedido: ${response.statusText}`);
      }
      
      console.log('Pedido atualizado com sucesso no Supabase:', { id, ...updatedOrder });
    } catch (error) {
      console.error('Erro inesperado ao atualizar pedido:', error);
      fetchOrders();
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    // Optimistic update
    const previousOrders = [...orders];
    setOrders((prev) => prev.filter((order) => order.id !== id));

    try {
      const response = await fetch(`${SUPABASE_URL}?id=eq.${id}`, {
        method: 'DELETE',
        headers,
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro detalhado do Supabase:', errorData);
        throw new Error(`Erro ao excluir pedido: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      // Revert optimistic update on error
      setOrders(previousOrders);
      alert('Erro ao excluir pedido no banco de dados.');
    }
  };

  return { orders, addOrder, updateOrder, deleteOrder, loading };
}
