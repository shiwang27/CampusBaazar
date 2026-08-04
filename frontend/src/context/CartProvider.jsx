import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext'

const CART_KEY = 'campusbaazar-cart'
const stockLimit = (item) => Math.max(1, Math.floor(Number(item.stockQuantity) || (item.isDemo ? 5 : 1)))

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem(CART_KEY) || '[]'))
  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(items)), [items])

  function addItem(listing, quantity = 1) {
    setItems((current) => {
      const exists = current.find((item) => item.id === listing.id)
      if (exists) return current.map((item) => item.id === listing.id ? { ...item, quantity: Math.min(item.quantity + quantity, stockLimit(item)) } : item)
      return [...current, { ...listing, quantity: Math.min(quantity, stockLimit(listing)) }]
    })
  }
  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))
  const setQuantity = (id, quantity) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, stockLimit(item))) } : item))
  const clearCart = () => setItems([])
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const value = useMemo(() => ({ items, itemCount, total, addItem, removeItem, setQuantity, clearCart }), [items, itemCount, total])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
