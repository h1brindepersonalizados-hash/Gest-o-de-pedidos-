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

    // Integração com script externo (Google Sheets, etc) solicitada
    try {
      await fetch("SUA_URL_DO_SCRIPT", {
        method: "POST",
        body: JSON.stringify({
          tipo: "pedido",
          nome: newOrder.clientName,
          telefone: newOrder.clientPhone || "",
          produto: newOrder.product,
          valor: newOrder.value,
          status: "Em produção" // Conforme solicitado no snippet
        })
      });
      // Opcional: alert("Pedido salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar para o script:", error);
    }

    return newOrder;
  };

  const addMultipleOrders = async (newOrdersData: Omit<Order, 'id' | 'createdAt'>[]) => {
    const ordersToAdd = newOrdersData.map(order => ({
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }));
    
    const newOrders = [...ordersToAdd, ...orders];
    saveOrders(newOrders);

    // Opcional: enviar para o script externo em lote ou um a um.
    // Como não sabemos se o script suporta lote, vamos enviar um a um de forma assíncrona
    // sem bloquear a UI.
    ordersToAdd.forEach(async (newOrder) => {
      try {
        await fetch("SUA_URL_DO_SCRIPT", {
          method: "POST",
          body: JSON.stringify({
            tipo: "pedido",
            nome: newOrder.clientName,
            telefone: newOrder.clientPhone || "",
            produto: newOrder.product,
            valor: newOrder.value,
            status: "Em produção"
          })
        });
      } catch (error) {
        console.error("Erro ao enviar para o script:", error);
      }
    });

    return ordersToAdd;
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

  const deleteMultipleOrders = async (ids: string[]) => {
    const newOrders = orders.filter((order) => !ids.includes(order.id));
    saveOrders(newOrders);
  };

  return { orders, addOrder, addMultipleOrders, updateOrder, deleteOrder, deleteMultipleOrders, loading };
}
