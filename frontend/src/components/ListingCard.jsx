import { Eye, Heart, MapPin, ShoppingCart } from 'lucide-react'
import { getProductImageUrl } from '../api/products'

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export default function ListingCard({ listing, saved, onSave, onOpen, onAddToCart, onBuyNow }) {
  const sold = listing.available === false || listing.listingStatus === 'SOLD'
  const stock = Math.max(1, Number(listing.stockQuantity) || (listing.isDemo ? 5 : 1))
  return <article className="listing-card">
    <button type="button" className="card-open-target" onClick={onOpen} aria-label={`View ${listing.name}`} />
    <div className="listing-image-wrap">
      <img src={listing.imageUrl || getProductImageUrl(listing.id)} alt={listing.name} className="listing-image" loading="lazy" />
      <span className="condition-badge">{listing.itemCondition || 'Pre-owned'}</span>
      <button type="button" className={saved ? 'save-listing saved' : 'save-listing'} onClick={onSave} aria-label={saved ? `Remove ${listing.name} from saved` : `Save ${listing.name}`}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
      <span className="quick-view" aria-hidden="true"><Eye size={16} />View details</span>
    </div>
    <div className="listing-body">
      <div className="listing-meta"><span>{listing.category}</span><span>{listing.brand}</span></div>
      <h3>{listing.name}</h3>
      <div className="campus-line"><MapPin size={14} /> {listing.institution || listing.location || 'Campus pickup'}</div>
      <span className={sold ? 'stock-line sold' : 'stock-line'}>{sold ? 'Sold' : `${stock} available`}</span>
      <div className="price-line"><strong>{currency.format(Number(listing.price) || 0)}</strong><s>{currency.format(Math.round(Number(listing.price) * 1.24) || 0)}</s></div>
      <div className="card-actions"><button type="button" className="add-cart" onClick={onAddToCart} disabled={sold}><ShoppingCart size={17} />{sold ? 'Sold' : 'Add to cart'}</button><button type="button" className="buy-now" onClick={onBuyNow} disabled={sold}>Buy now</button></div>
    </div>
  </article>
}
