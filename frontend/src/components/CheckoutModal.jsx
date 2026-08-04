import { Check, LoaderCircle, MapPin, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { orderApi } from '../api/products'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export default function CheckoutModal({ onClose }) {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const [form, setForm] = useState({ phone: '', fulfillmentMethod: 'Campus pickup', meetingPoint: '', paymentMethod: 'Pay on meetup' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const liveItems = items.filter((item) => !String(item.id).startsWith('demo-'))
      if (liveItems.length) await orderApi.create({ ...form, items: liveItems.map((item) => ({ productId: item.id, quantity: item.quantity })) })
      clearCart(); setComplete(true)
    } catch (requestError) { setError(requestError.message || 'Checkout could not be completed.') }
    finally { setLoading(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close checkout"><X size={20} /></button>
      {complete ? <div className="checkout-success"><span><Check size={30} /></span><p>Order request sent</p><h2 id="checkout-title">Your campus exchange is underway.</h2><p>The seller can now confirm the meeting point with you. Pay only after checking the item in person.</p><button type="button" onClick={onClose}>Back to marketplace</button></div> : <>
        <div className="checkout-heading"><span><ShieldCheck size={18} /> Secure campus checkout</span><h2 id="checkout-title">Confirm your exchange</h2><p>Buying as {user.name} at {user.institution}</p></div>
        <div className="checkout-layout"><form onSubmit={submit}>
          <label className="field"><span>Phone / WhatsApp</span><input required value={form.phone} onChange={update('phone')} placeholder="10-digit mobile number" /></label>
          <label className="field"><span>Exchange method</span><select value={form.fulfillmentMethod} onChange={update('fulfillmentMethod')}><option>Campus pickup</option><option>Meet the seller nearby</option></select></label>
          <label className="field"><span>Preferred meeting point</span><div className="input-with-icon"><MapPin size={17} /><input required value={form.meetingPoint} onChange={update('meetingPoint')} placeholder="Library entrance, main gate..." /></div></label>
          <label className="field"><span>Payment</span><select value={form.paymentMethod} onChange={update('paymentMethod')}><option>Pay on meetup</option><option>UPI on meetup</option></select></label>
          {error && <p className="form-error">{error}</p>}
          <button className="place-order" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} />Placing request</> : 'Place order request'}</button>
        </form><aside className="order-review"><span>Order summary</span>{items.map((item) => <div key={item.id}><p>{item.name}<small>Qty {item.quantity}</small></p><strong>{currency.format(Number(item.price) * item.quantity)}</strong></div>)}<div className="review-total"><p>Total</p><strong>{currency.format(total)}</strong></div><small>No online payment is collected by CampusBaazar.</small></aside></div>
      </>}
    </section>
  </div>
}
