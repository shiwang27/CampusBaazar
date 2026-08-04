import { useEffect, useState } from 'react'
import { ImagePlus, LoaderCircle, UploadCloud, X } from 'lucide-react'

const initialForm = { name: '', category: 'Textbooks', price: '', stockQuantity: '1', itemCondition: 'Good', brand: '', description: '', sellerName: '', sellerContact: '', institution: '', location: '' }
function todayForApi() {
  const date = new Date()
  return [String(date.getDate()).padStart(2, '0'), String(date.getMonth() + 1).padStart(2, '0'), date.getFullYear()].join('-')
}

export default function SellModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  function selectImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Please choose an image smaller than 5 MB.'); return }
    if (preview) URL.revokeObjectURL(preview)
    setImage(file); setPreview(URL.createObjectURL(file)); setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (!image) { setError('Add one clear photo so buyers can inspect the item.'); return }
    setSubmitting(true); setError('')
    try {
      await onSubmit({ image, product: { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity), releaseDate: todayForApi(), available: true } })
    } catch (requestError) {
      setError(requestError.message || 'Could not publish the listing. Check that the backend is running.')
      setSubmitting(false)
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="sell-modal" role="dialog" aria-modal="true" aria-labelledby="sell-title">
      <div className="modal-heading"><div><span>New listing</span><h2 id="sell-title">Sell a study item</h2></div><button className="modal-close static" type="button" onClick={onClose} aria-label="Close sell form"><X size={20} /></button></div>
      <form onSubmit={submit}>
        <div className="sell-form-scroll">
          <label className={preview ? 'image-dropzone has-preview' : 'image-dropzone'}>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} />
            {preview ? <img src={preview} alt="Listing preview" /> : <><UploadCloud size={28} /><strong>Add a clear item photo</strong><span>JPG, PNG or WebP up to 5 MB</span></>}
            {preview && <span className="replace-image"><ImagePlus size={16} /> Replace photo</span>}
          </label>
          <div className="form-grid">
            <label className="field full"><span>Item title</span><input required maxLength="90" value={form.name} onChange={update('name')} placeholder="e.g. HC Verma Physics Vol. 1" /></label>
            <label className="field"><span>Category</span><select value={form.category} onChange={update('category')}><option>Textbooks</option><option>Calculators</option><option>Notes</option><option>Lab gear</option><option>Electronics</option><option>Art supplies</option><option>Other</option></select></label>
            <label className="field"><span>Condition</span><select value={form.itemCondition} onChange={update('itemCondition')}><option>Like new</option><option>Good</option><option>Fair</option><option>Well used</option></select></label>
            <label className="field"><span>Price (INR)</span><input required min="0" step="1" type="number" value={form.price} onChange={update('price')} placeholder="450" /></label>
            <label className="field"><span>Quantity available</span><input required min="1" max="999" step="1" type="number" value={form.stockQuantity} onChange={update('stockQuantity')} /></label>
            <label className="field"><span>Author / brand</span><input value={form.brand} onChange={update('brand')} placeholder="Publisher or brand" /></label>
            <label className="field full"><span>Description</span><textarea required rows="3" maxLength="500" value={form.description} onChange={update('description')} placeholder="Mention edition, markings, accessories and anything a buyer should know." /></label>
            <label className="field"><span>Your name</span><input required value={form.sellerName} onChange={update('sellerName')} placeholder="First name is enough" /></label>
            <label className="field"><span>Email or WhatsApp</span><input required value={form.sellerContact} onChange={update('sellerContact')} placeholder="student@email.com" /></label>
            <label className="field"><span>College / school</span><input required value={form.institution} onChange={update('institution')} placeholder="Your institution" /></label>
            <label className="field"><span>Pickup area</span><input required value={form.location} onChange={update('location')} placeholder="Library gate, hostel, etc." /></label>
          </div>
          {error && <p className="form-error">{error}</p>}
        </div>
        <div className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={18} /> Publishing</> : 'Publish listing'}</button></div>
      </form>
    </section>
  </div>
}
