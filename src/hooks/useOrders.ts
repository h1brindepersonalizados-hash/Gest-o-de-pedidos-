import { useState, useEffect } from 'react';
import { Order } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Error parsing orders from localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('orders', JSON.stringify(newOrders));
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    const newOrder = { 
      ...order, 
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const newOrders = [newOrder, ...orders];
    saveOrders(newOrders);
    return newOrder;
  };

  const updateOrder = async (id: string, updatedOrder: Partial<Order>) => {
    const newOrders = orders.map((order) => 
      order.id === id ? { ...order, ...updatedOrder } : order
    );
    saveOrders(newOrders);
  };

  const deleteOrder = async (id: string) => {
    const newOrders = orders.filter((order) => order.id !== id);
    saveOrders(newOrders);
  };

  return { orders, addOrder, updateOrder, deleteOrder, loading };
}
