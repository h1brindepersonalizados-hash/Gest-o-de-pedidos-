import { useState, useEffect } from 'react';
import { Order } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse orders from localStorage', e);
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to localStorage:', e);
      alert('Erro ao salvar: limite de armazenamento do navegador atingido. Tente remover imagens de pedidos antigos.');
    }
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder = { 
      ...order, 
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  const updateOrder = (id: string, updatedOrder: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updatedOrder } : order))
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return { orders, addOrder, updateOrder, deleteOrder };
}
