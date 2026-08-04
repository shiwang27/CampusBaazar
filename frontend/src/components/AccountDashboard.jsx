import { Check, ClipboardList, FileText, Package, ShieldCheck, ShoppingBag, Trash2, UserRound, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi, profileApi } from '../api/products'
import { useAuth } from '../context/useAuth'

export default function AccountDashboard({ mode = 'profile', onClose, toast }) {
  const { user } = useAuth()
  const [tab, setTab] = useState(mode === 'admin' ? 'admin' : 'overview')
  const [data, setData] = useState({ listings: [], purchases: [], sales: [], materials: [], summary: {}, users: [], products: [], orders: [], adminMaterials: [] })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [listings, purchases, sales, materials] = await Promise.all([profileApi.listings(), profileApi.purchases(), profileApi.sales(), profileApi.materials()])
      let admin = {}
      if (user.role === 'ADMIN') { const [summary, users, products, orders, adminMaterials] = await Promise.all([adminApi.summary(), adminApi.users(), adminApi.products(), adminApi.orders(), adminApi.materials()]); admin = { summary, users, products, orders, adminMaterials } }
      setData((current) => ({ ...current, listings, purchases, sales, materials, ...admin }))
    } catch (error) { if (!silent) toast(error.message) } finally { if (!silent) setLoading(false) }
  }, [toast, user.role])
  useEffect(() => {
    load()
    const refresh = () => load(true)
    const interval = window.setInterval(refresh, 10000)
    window.addEventListener('focus', refresh)
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh) }
  }, [load])
  async function status(orderId, productId, next) {
    try {
      await profileApi.updateSale(orderId, productId, next)
      await load(true)
      toast(`Request ${next.toLowerCase()}.`)
    } catch (error) { toast(error.message) }
  }
  async function remove(kind, id) { await adminApi.remove(kind, id); toast('Record deleted.'); load() }
  const saleLines = data.sales.flatMap((order) => order.lines.filter((line) => line.sellerId === user.id).map((line) => ({ ...line, order })))

  return <div className="modal-backdrop dashboard-backdrop"><section className="account-dashboard"><aside><button className="dashboard-close" onClick={onClose} aria-label="Close dashboard"><X size={20} /></button><div className="profile-avatar">{user.name.charAt(0)}</div><h2>{user.name}</h2><p>{user.collegeEmail || user.email}</p><span>{user.role === 'ADMIN' ? <><ShieldCheck size={13} /> Administrator</> : <><Check size={13} /> Verified student</>}</span><nav><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}><UserRound size={17} /> Overview</button><button className={tab === 'listings' ? 'active' : ''} onClick={() => setTab('listings')}><Package size={17} /> My listings</button><button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}><ClipboardList size={17} /> Buyer requests <b>{saleLines.filter((line) => !line.requestStatus || line.requestStatus === 'REQUESTED').length}</b></button><button className={tab === 'purchases' ? 'active' : ''} onClick={() => setTab('purchases')}><ShoppingBag size={17} /> Purchases</button><button className={tab === 'materials' ? 'active' : ''} onClick={() => setTab('materials')}><FileText size={17} /> My resources</button>{user.role === 'ADMIN' && <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}><ShieldCheck size={17} /> Admin console</button>}</nav></aside><main>{loading ? <div className="dashboard-loading">Loading your campus activity...</div> : <>
      {tab === 'overview' && <div className="dashboard-view"><span className="dashboard-eyebrow">Account overview</span><h2>Your CampusBaazar activity</h2><div className="stat-row"><article><strong>{data.listings.length}</strong><span>Items listed</span></article><article><strong>{saleLines.length}</strong><span>Buyer requests</span></article><article><strong>{data.purchases.length}</strong><span>Purchases</span></article><article><strong>{data.materials.length}</strong><span>Free resources</span></article></div><section className="profile-info"><h3>Student profile</h3><div><p><span>College</span><strong>{user.institution}</strong></p><p><span>Personal email</span><strong>{user.email}</strong></p><p><span>College email</span><strong>{user.collegeEmail || 'Not added'}</strong></p><p><span>Account role</span><strong>{user.role}</strong></p></div></section></div>}
      {tab === 'listings' && <DashboardList title="My listings" empty="You have not listed an item yet." items={data.listings} render={(item) => <><div><b>{item.name}</b><span>{item.category} · ₹{item.price}</span></div><em className={(item.listingStatus || 'AVAILABLE').toLowerCase()}>{item.listingStatus || (item.available ? 'AVAILABLE' : 'SOLD')}</em></>} />}
      {tab === 'requests' && <DashboardList title="Buyer requests" empty="No one has requested your items yet." items={saleLines} render={(line) => <><div><b>{line.productName}</b><span>{line.order.buyerName} · {line.order.buyerEmail} · {line.order.phone}</span><small>Meet at {line.order.meetingPoint}</small></div><div className="request-actions"><em>{line.requestStatus || 'REQUESTED'}</em>{(!line.requestStatus || line.requestStatus === 'REQUESTED') && <><button onClick={() => status(line.order.id, line.productId, 'ACCEPTED')}>Accept</button><button onClick={() => status(line.order.id, line.productId, 'DECLINED')}>Decline</button></>}{line.requestStatus === 'ACCEPTED' && <button onClick={() => status(line.order.id, line.productId, 'COMPLETED')}>Mark sold</button>}</div></>} />}
      {tab === 'purchases' && <DashboardList title="My purchase requests" empty="You have not requested an item yet." items={data.purchases} render={(order) => <><div className="purchase-request"><b>Request #{order.id}</b><small>{order.meetingPoint} · {new Date(order.createdAt).toLocaleDateString()}</small><div className="purchase-lines">{order.lines.map((line) => <span key={line.productId}><strong>{line.productName}</strong><em className={(line.requestStatus || order.status || 'REQUESTED').toLowerCase()}>{line.requestStatus || order.status || 'REQUESTED'}</em></span>)}</div></div>{order.lines.length > 1 && <em className={(order.status || 'REQUESTED').toLowerCase()}>{order.status || 'REQUESTED'}</em>}</>} />}
      {tab === 'materials' && <DashboardList title="My shared resources" empty="You have not shared study material yet." items={data.materials} render={(item) => <><div><b>{item.title}</b><span>{item.subject} · {item.academicYear}</span></div><em>{item.materialType}</em></>} />}
      {tab === 'admin' && <div className="dashboard-view admin-view"><span className="dashboard-eyebrow">Administrator access</span><h2>Marketplace control room</h2><div className="stat-row">{Object.entries(data.summary).map(([key, value]) => <article key={key}><strong>{value}</strong><span>{key}</span></article>)}</div><h3>Users</h3><div className="admin-table">{data.users.map((item) => <div key={item.id}><span><b>{item.name}</b><small>{item.email} · {item.institution}</small></span><em>{item.role || 'STUDENT'}</em>{item.id !== user.id && <button onClick={() => remove('users', item.id)} title="Delete user"><Trash2 size={16} /></button>}</div>)}</div><h3>Buyer requests</h3><div className="admin-table">{data.orders.map((item) => <div key={item.id}><span><b>#{item.id} · {item.buyerName}</b><small>{item.lines.map((line) => line.productName).join(', ')}</small></span><em>{item.status}</em><button onClick={() => remove('orders', item.id)} title="Delete request"><Trash2 size={16} /></button></div>)}</div></div>}
    </>}</main></section></div>
}

function DashboardList({ title, empty, items, render }) { return <div className="dashboard-view"><span className="dashboard-eyebrow">Account activity</span><h2>{title}</h2>{items.length ? <div className="dashboard-list">{items.map((item, index) => <article key={item.id || `${title}-${index}`}>{render(item)}</article>)}</div> : <div className="dashboard-empty">{empty}</div>}</div> }
