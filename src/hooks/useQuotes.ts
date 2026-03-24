import { useState, useEffect } from 'react';
import { Quote } from '../types';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('quotes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }, [quotes]);

  const addQuote = (quote: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote: Quote = {
      ...quote,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setQuotes((prev) => [...prev, newQuote]);
  };

  const updateQuote = (id: string, updatedQuote: Omit<Quote, 'id' | 'createdAt'> | Quote) => {
    setQuotes((prev) =>
      prev.map((quote) => (quote.id === id ? { ...quote, ...updatedQuote } : quote))
    );
  };

  const deleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((quote) => quote.id !== id));
  };

  return { quotes, addQuote, updateQuote, deleteQuote };
}
