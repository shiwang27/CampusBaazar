const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('campusbaazar-token')
  const isForm = options.body instanceof FormData
  const headers = { ...options.headers }
  if (!isForm && options.body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('CampusBaazar services are offline. Please try again in a moment.')
  }
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? await response.json() : await response.text()
    throw new Error(payload?.detail || payload?.message || payload || `Request failed with status ${response.status}`)
  }
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') ? response.json() : response.text()
}

export const getProducts = () => request('/products')
export const searchProducts = (keyword) => request(`/products/search?keyword=${encodeURIComponent(keyword)}`)
export const getProductImageUrl = (id) => `${API_BASE_URL}/product/${id}/image`

export function createProduct(product, imageFile) {
  const body = new FormData()
  body.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }))
  body.append('imageFile', imageFile)
  return request('/product', { method: 'POST', body })
}

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (profile) => request('/auth/register', { method: 'POST', body: JSON.stringify(profile) }),
  me: () => request('/auth/me'),
}

export const orderApi = {
  create: (checkout) => request('/orders', { method: 'POST', body: JSON.stringify(checkout) }),
  mine: () => request('/orders/me'),
}

export const profileApi = {
  get: () => request('/profile'),
  update: (changes) => request('/profile', { method: 'PATCH', body: JSON.stringify(changes) }),
  listings: () => request('/profile/listings'),
  purchases: () => request('/profile/purchases'),
  sales: () => request('/profile/sales'),
  materials: () => request('/profile/materials'),
  updateSale: (orderId, productId, status) => request('/profile/sales/status', { method: 'PATCH', body: JSON.stringify({ orderId, productId, status }) }),
}

export const materialApi = {
  list: () => request('/materials'),
  downloadUrl: (id) => `${API_BASE_URL}/materials/${id}/download`,
  create(material, file) {
    const body = new FormData()
    body.append('material', JSON.stringify(material))
    if (file) body.append('file', file)
    return request('/materials', { method: 'POST', body })
  },
  remove: (id) => request(`/materials/${id}`, { method: 'DELETE' }),
}

export const adminApi = {
  summary: () => request('/admin/summary'),
  users: () => request('/admin/users'),
  products: () => request('/admin/products'),
  orders: () => request('/admin/orders'),
  materials: () => request('/admin/materials'),
  remove: (kind, id) => request(`/admin/${kind}/${id}`, { method: 'DELETE' }),
}
