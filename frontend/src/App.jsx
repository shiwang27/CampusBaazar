import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown, HeartHandshake, MapPin, Search, ShieldCheck, ShoppingBag, Sparkles, Tag, UserCheck, UsersRound } from 'lucide-react'
import { createProduct, getProducts, searchProducts } from './api/products'
import { DEMO_LISTINGS } from './data/demoListings'
import { useAuth } from './context/useAuth'
import { useCart } from './context/useCart'
import AuthModal from './components/AuthModal'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import Header from './components/Header'
import ListingCard from './components/ListingCard'
import ListingDetails from './components/ListingDetails'
import SellModal from './components/SellModal'
import MaterialsSection from './components/MaterialsSection'
import AccountDashboard from './components/AccountDashboard'
import './App.css'

const categories = [
  { label: 'Textbooks', value: 'Textbooks', image: '/images/categories/textbooks.png' },
  { label: 'Calculators', value: 'Calculators', image: '/images/categories/calculators.png' },
  { label: 'Class notes', value: 'Notes', image: '/images/categories/notes.png' },
  { label: 'Lab gear', value: 'Lab gear', image: '/images/categories/lab-gear.png' },
  { label: 'Electronics', value: 'Electronics', image: '/images/categories/electronics.png' },
  { label: 'Art supplies', value: 'Art supplies', image: '/images/categories/art-supplies.png' },
  { label: 'Other', value: 'Other', image: '/images/categories/other.png' },
]

function App() {
  const { isAuthenticated } = useAuth()
  const { addItem, items: cartItems } = useCart()
  const [listings, setListings] = useState([])
  const [apiState, setApiState] = useState('loading')
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [campus, setCampus] = useState('All campuses')
  const [sort, setSort] = useState('newest')
  const [saved, setSaved] = useState(() => new Set(JSON.parse(localStorage.getItem('campusbaazar-saved') || '[]')))
  const [sellOpen, setSellOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState('')
  const [selectedListing, setSelectedListing] = useState(null)
  const [dashboardMode, setDashboardMode] = useState('')
  const [toast, setToast] = useState('')

  const loadListings = useCallback(async (keyword = '') => {
    setApiState('loading')
    try {
      const data = keyword ? await searchProducts(keyword) : await getProducts()
      setListings(Array.isArray(data) ? data : [])
      setApiState(data.length ? 'online' : 'empty')
    } catch (error) {
      console.error(error); setListings([]); setApiState('error')
    }
  }, [])

  useEffect(() => { loadListings() }, [loadListings])
  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const sourceListings = listings.length ? listings : DEMO_LISTINGS
  const campuses = useMemo(() => ['All campuses', ...new Set(sourceListings.map((item) => item.institution).filter(Boolean))], [sourceListings])
  const visibleListings = useMemo(() => {
    const normalized = activeQuery.trim().toLowerCase()
    const filtered = sourceListings.filter((item) => {
      const searchable = [item.name, item.description, item.brand, item.institution, item.location].filter(Boolean).join(' ').toLowerCase()
      return (!normalized || searchable.includes(normalized)) && (category === 'All' || item.category === category) && (campus === 'All campuses' || item.institution === campus)
    })
    return [...filtered].sort((a, b) => sort === 'price-low' ? Number(a.price) - Number(b.price) : sort === 'price-high' ? Number(b.price) - Number(a.price) : Number.parseInt(String(b.id).replace(/\D/g, '') || 0) - Number.parseInt(String(a.id).replace(/\D/g, '') || 0))
  }, [activeQuery, campus, category, sort, sourceListings])

  function submitSearch(event) {
    event.preventDefault(); const value = query.trim(); setActiveQuery(value)
    if (listings.length) loadListings(value)
    document.querySelector('#marketplace-title')?.scrollIntoView({ behavior: 'smooth' })
  }
  function chooseCategory(value) { setCategory(value); document.querySelector('#marketplace-title')?.scrollIntoView({ behavior: 'smooth' }) }
  function toggleSaved(id) {
    setSaved((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); localStorage.setItem('campusbaazar-saved', JSON.stringify([...next])); return next })
  }
  function requireAuth(action) {
    if (isAuthenticated) { if (action === 'sell') setSellOpen(true); if (action === 'checkout') setCheckoutOpen(true); return }
    setPendingAction(action); setAuthOpen(true)
  }
  function authSuccess() {
    if (pendingAction === 'sell') setSellOpen(true)
    if (pendingAction === 'checkout') setCheckoutOpen(true)
    setPendingAction('')
  }
  function addToCart(listing, openCart = false) {
    if (listing.available === false || listing.listingStatus === 'SOLD') { setToast('This item has already been sold.'); return false }
    const limit = Math.max(1, Number(listing.stockQuantity) || (listing.isDemo ? 5 : 1))
    const currentQuantity = cartItems.find((item) => item.id === listing.id)?.quantity || 0
    if (currentQuantity >= limit) { setToast(`Only ${limit} available for this item.`); if (openCart) setCartOpen(true); return false }
    addItem(listing); setToast(`${listing.name} added to your cart.`); if (openCart) setCartOpen(true); return true
  }
  function buyNow(listing) { if (addToCart(listing)) { setSelectedListing(null); requireAuth('checkout') } }
  function beginCheckout() { setCartOpen(false); requireAuth('checkout') }
  async function handleCreateListing(payload) {
    await createProduct(payload.product, payload.image); setSellOpen(false); setToast('Your listing is now live.'); await loadListings()
  }

  return <div className="app-shell" id="top">
    <Header savedCount={saved.size} onSell={() => requireAuth('sell')} onAuth={() => setAuthOpen(true)} onCart={() => setCartOpen(true)} onProfile={() => setDashboardMode('profile')} onAdmin={() => setDashboardMode('admin')} query={query} setQuery={setQuery} onSearch={submitSearch} />
    <main>
      <section className="hero-storefront">
        <img src="/images/campusbaazar-hero.png" alt="Backpack, books, calculator and headphones arranged for campus study" />
        <div className="hero-overlay"><span><Sparkles size={15} /> New semester marketplace</span><h1>Smart finds for brighter semesters.</h1><p>Buy trusted study essentials from students nearby, or give your own materials a useful second life.</p><div className="hero-actions"><a href="#marketplace-title">Shop campus finds <ArrowRight size={17} /></a><button type="button" onClick={() => requireAuth('sell')}>Sell your materials</button></div><div className="hero-social-proof"><div><b>A</b><b>M</b><b>R</b><b>K</b></div><p><strong>2,400+ students</strong><span>buying and selling locally</span></p></div></div>
      </section>

      <section className="service-strip" aria-label="Marketplace benefits">
        <div><span><UsersRound size={20} /></span><p><strong>Meet directly</strong><small>Choose a public campus location</small></p></div>
        <div><span><ShieldCheck size={20} /></span><p><strong>Safer exchanges</strong><small>Check before you pay</small></p></div>
        <div><span><HeartHandshake size={20} /></span><p><strong>Student prices</strong><small>Useful gear without retail markup</small></p></div>
        <div><span><UserCheck size={20} /></span><p><strong>Verified accounts</strong><small>One community for every campus</small></p></div>
      </section>

      <section className="category-section" id="categories">
        <div className="section-heading"><div><span>Browse the baazar</span><h2>Shop by category</h2></div><a href="#marketplace-title">View all materials <ArrowRight size={16} /></a></div>
        <div className="category-gallery">{categories.map(({ label, value, image }) => <button type="button" key={value} onClick={() => chooseCategory(value)} className={category === value ? 'active' : ''}><span className="category-art"><img src={image} alt="" /></span><strong>{label}</strong><small>{sourceListings.filter((item) => item.category === value).length} items</small></button>)}</div>
      </section>

      <section className="marketplace" aria-labelledby="marketplace-title">
        <div className="marketplace-toolbar"><div><span className="section-label">Popular near you</span><h2 id="marketplace-title">Best campus finds</h2><p>{visibleListings.length} affordable materials ready for a new owner</p></div><div className="toolbar-controls"><label className="select-control"><MapPin size={16} /><select value={campus} onChange={(event) => setCampus(event.target.value)} aria-label="Filter by campus">{campuses.map((name) => <option key={name}>{name}</option>)}</select><ChevronDown size={14} /></label><label className="select-control"><Tag size={16} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort listings"><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></label></div></div>
        {(apiState === 'error' || apiState === 'empty') && <div className="preview-note">{apiState === 'error' ? 'Live API is reconnecting. Preview products are available meanwhile.' : 'Be the first live seller. Preview products show how your listing will look.'}</div>}
        {apiState === 'loading' ? <div className="listing-grid">{[1,2,3,4].map((item) => <div className="listing-skeleton" key={item} />)}</div> : visibleListings.length ? <div className="listing-grid">{visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} saved={saved.has(listing.id)} onSave={() => toggleSaved(listing.id)} onOpen={() => setSelectedListing(listing)} onAddToCart={() => addToCart(listing)} onBuyNow={() => buyNow(listing)} />)}</div> : <div className="empty-state"><Search size={26} /><h3>No matching materials</h3><p>Try another campus, category or search phrase.</p><button type="button" onClick={() => { setQuery(''); setActiveQuery(''); setCategory('All'); setCampus('All campuses'); loadListings() }}>Reset filters</button></div>}
      </section>

      <section className="seller-promo"><div><span>Clear your shelf</span><h2>Your last semester can fund the next one.</h2><p>List books, calculators, project supplies and course gear. Add a photo, choose a campus pickup point, and reach students who need it.</p><button type="button" onClick={() => requireAuth('sell')}>Start selling <ArrowRight size={17} /></button></div><div className="promo-stat"><strong>0%</strong><span>listing fee for students</span></div></section>

      <MaterialsSection isAuthenticated={isAuthenticated} onRequireAuth={() => { setPendingAction('materials'); setAuthOpen(true) }} toast={setToast} />

      <section className="how-section" id="how-it-works"><div className="section-heading centered"><div><span>Simple by design</span><h2>From shelf to student in three steps</h2></div></div><div className="step-grid"><article><span>01</span><div><ShoppingBag size={24} /></div><h3>Discover locally</h3><p>Search by course material, category or campus.</p></article><article><span>02</span><div><ShieldCheck size={24} /></div><h3>Check the details</h3><p>Review condition, seller information and pickup area.</p></article><article><span>03</span><div><HeartHandshake size={24} /></div><h3>Meet and exchange</h3><p>Inspect the item in person and pay the seller safely.</p></article></div></section>

      <section className="newsletter"><div><span>CampusBaazar dispatch</span><h2>Get the best finds before your next class.</h2></div><form onSubmit={(event) => { event.preventDefault(); setToast('You are on the CampusBaazar list.') }}><input required type="email" aria-label="Newsletter email" placeholder="Your student email" /><button type="submit">Subscribe <ArrowRight size={17} /></button></form></section>
    </main>

    <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><a className="brand" href="#top"><span className="brand-icon"><ShoppingBag size={20} /></span><span>Campus<span>Baazar</span></span></a><p>A lighter way for students to buy, sell and reuse study materials inside their campus community.</p><span>Made thoughtfully for student life.</span></div><div><h3>Marketplace</h3><a href="#marketplace-title">Browse all</a><a href="#categories">Categories</a><button type="button" onClick={() => requireAuth('sell')}>Sell an item</button></div><div><h3>Student help</h3><a href="#how-it-works">How it works</a><a href="#top">Safer exchanges</a><a href="mailto:hello@campusbaazar.in">Contact support</a></div><div><h3>Popular searches</h3><button type="button" onClick={() => chooseCategory('Textbooks')}>Used textbooks</button><button type="button" onClick={() => chooseCategory('Calculators')}>Calculators</button><button type="button" onClick={() => chooseCategory('Electronics')}>Electronics</button></div></div><div className="footer-bottom"><span>© 2026 CampusBaazar</span><div><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Community rules</a></div><strong>Reuse more. Spend less.</strong></div></footer>

    {authOpen && <AuthModal onClose={() => { setAuthOpen(false); setPendingAction('') }} onSuccess={authSuccess} />}
    {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} onCheckout={beginCheckout} />}
    {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    {sellOpen && <SellModal onClose={() => setSellOpen(false)} onSubmit={handleCreateListing} />}
    {selectedListing && <ListingDetails listing={selectedListing} onClose={() => setSelectedListing(null)} saved={saved.has(selectedListing.id)} onSave={() => toggleSaved(selectedListing.id)} onAddToCart={() => addToCart(selectedListing, true)} onBuyNow={() => buyNow(selectedListing)} />}
    {dashboardMode && <AccountDashboard mode={dashboardMode} onClose={() => setDashboardMode('')} toast={setToast} />}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}

export default App
