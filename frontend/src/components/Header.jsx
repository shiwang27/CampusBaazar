import { ChevronDown, Heart, LayoutDashboard, Menu, Plus, Search, ShieldCheck, ShoppingCart, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'

export default function Header({ savedCount, onSell, onAuth, onCart, onProfile, onAdmin, query, setQuery, onSearch }) {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  return <>
    <div className="announcement-bar"><span>Meet on campus. Inspect in person. Exchange directly.</span><span>Verified student accounts</span><span>Support: hello@campusbaazar.in</span></div>
    <header className="site-header">
      <a className="brand logo-brand" href="#top" aria-label="CampusBaazar home"><img src="/images/campusbaazar-logo.png" alt="CampusBaazar" /></a>
      <nav className={mobileOpen ? 'main-nav open' : 'main-nav'} aria-label="Primary navigation">
        <a href="#marketplace-title" onClick={() => setMobileOpen(false)}>Shop</a>
        <a href="#categories" onClick={() => setMobileOpen(false)}>Categories</a>
        <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
        <button className="nav-sell" type="button" onClick={() => { onSell(); setMobileOpen(false) }}><Plus size={17} />Sell</button>
      </nav>
      <form className="header-search" onSubmit={onSearch}>
        <Search size={17} />
        <input aria-label="Search the marketplace" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search materials" />
      </form>
      <div className="header-actions">
        <button className="icon-action" type="button" title="Saved listings"><Heart size={20} /><span className="count-badge">{savedCount}</span></button>
        <button className="icon-action" type="button" onClick={onCart} title="Open cart"><ShoppingCart size={20} /><span className="count-badge">{itemCount}</span></button>
        {isAuthenticated ? <div className="account-wrap">
          <button className="account-button" type="button" onClick={() => setAccountOpen((open) => !open)}><span>{user.name.charAt(0).toUpperCase()}</span><div><small>Hello</small><strong>{user.name.split(' ')[0]}</strong></div><ChevronDown size={15} /></button>
          {accountOpen && <div className="account-menu"><strong>{user.name}</strong><span>{user.collegeEmail || user.email}</span><span>{user.institution}</span><button type="button" onClick={() => { onProfile(); setAccountOpen(false) }}><LayoutDashboard size={15} /> My profile</button>{user.role === 'ADMIN' && <button type="button" onClick={() => { onAdmin(); setAccountOpen(false) }}><ShieldCheck size={15} /> Admin console</button>}<button className="signout-action" type="button" onClick={() => { logout(); setAccountOpen(false) }}>Sign out</button></div>}
        </div> : <button className="login-button" type="button" onClick={onAuth}><UserRound size={18} />Login</button>}
        <button className="mobile-menu" type="button" aria-label="Toggle menu" onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
  </>
}
