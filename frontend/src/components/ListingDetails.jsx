import { Heart, Mail, MapPin, MessageCircle, School, ShoppingCart, Tag, X } from 'lucide-react'
import { getProductImageUrl } from '../api/products'

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
function contactHref(contact) {
  if (!contact) return null
  if (contact.includes('@')) return `mailto:${contact}`
  const digits = contact.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}` : null
}

export default function ListingDetails({ listing, onClose, onAddToCart, onBuyNow, onSave, saved }) {
  const href = contactHref(listing.sellerContact)
  const sold = listing.available === false || listing.listingStatus === 'SOLD'
  const stock = Math.max(1, Number(listing.stockQuantity) || (listing.isDemo ? 5 : 1))
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="listing-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close listing details"><X size={20} /></button>
      <div className="details-image-wrap"><img src={listing.imageUrl || getProductImageUrl(listing.id)} alt={listing.name} /><button type="button" className={saved ? 'detail-save saved' : 'detail-save'} onClick={onSave}><Heart size={18} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Saved' : 'Save item'}</button></div>
      <div className="details-content">
        <span className="detail-category">{listing.category}</span><h2 id="listing-title">{listing.name}</h2>
        <div className="details-price">{currency.format(Number(listing.price) || 0)} <s>{currency.format(Math.round(Number(listing.price) * 1.24) || 0)}</s></div>
        <p className="details-description">{listing.description}</p>
        <dl className="detail-list"><div><dt><Tag size={17} /> Condition</dt><dd>{listing.itemCondition || 'Pre-owned'}</dd></div><div><dt><School size={17} /> Campus</dt><dd>{listing.institution || 'Not specified'}</dd></div><div><dt><MapPin size={17} /> Pickup</dt><dd>{listing.location || 'Arrange with seller'}</dd></div><div><dt>Quantity</dt><dd>{sold ? 'Sold' : `${stock} available`}</dd></div></dl>
        <div className="detail-actions"><button type="button" onClick={onAddToCart} disabled={sold}><ShoppingCart size={18} />{sold ? 'Sold' : 'Add to cart'}</button><button type="button" onClick={onBuyNow} disabled={sold}>Buy now</button></div>
        <div className="seller-panel"><div className="seller-avatar">{(listing.sellerName || 'S').charAt(0).toUpperCase()}</div><div><span>Listed by</span><strong>{listing.sellerName || 'Student seller'}</strong></div>{href ? <a className="contact-button" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{listing.sellerContact.includes('@') ? <Mail size={18} /> : <MessageCircle size={18} />}Contact</a> : <span className="contact-missing">Sign in to contact</span>}</div>
        {listing.isDemo && <p className="demo-disclaimer">Preview listing. Live student listings use the same cart and checkout workflow.</p>}
      </div>
    </section>
  </div>
}
