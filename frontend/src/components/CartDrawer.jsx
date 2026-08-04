import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { getProductImageUrl } from '../api/products'
import { useCart } from '../context/useCart'

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export default function CartDrawer({ onClose, onCheckout }) {
  const { items, itemCount, total, removeItem, setQuantity } = useCart()
  return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="drawer-heading"><div><span>Your basket</span><h2 id="cart-title">Cart <small>{itemCount}</small></h2></div><button type="button" onClick={onClose} aria-label="Close cart"><X size={20} /></button></div>
      <div className="cart-content">
        {items.length ? items.map((item) => <article className="cart-item" key={item.id}>
          <img src={item.imageUrl || getProductImageUrl(item.id)} alt={item.name} />
          <div className="cart-item-info"><span>{item.category}</span><h3>{item.name}</h3><strong>{currency.format(Number(item.price))}</strong><small>{Math.max(1, Number(item.stockQuantity) || (item.isDemo ? 5 : 1))} available</small><div className="quantity-control"><button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity"><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= Math.max(1, Number(item.stockQuantity) || (item.isDemo ? 5 : 1))} aria-label="Increase quantity"><Plus size={14} /></button></div></div>
          <button className="remove-item" type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={17} /></button>
        </article>) : <div className="empty-cart"><span><ShoppingBag size={28} /></span><h3>Your cart is ready for a good find</h3><p>Add useful materials from the marketplace and they will appear here.</p><button type="button" onClick={onClose}>Continue shopping</button></div>}
      </div>
      {items.length > 0 && <div className="cart-summary"><div><span>Subtotal</span><strong>{currency.format(total)}</strong></div><p>No delivery fee. Meet sellers safely on campus.</p><button type="button" onClick={onCheckout}>Continue to checkout</button></div>}
    </aside>
  </div>
}
