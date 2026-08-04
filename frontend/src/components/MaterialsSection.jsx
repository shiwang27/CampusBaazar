import { BookOpenCheck, ExternalLink, FileText, LoaderCircle, Play, Plus, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { materialApi } from '../api/products'

const years = ['All years', '1st year', '2nd year', '3rd year', '4th year', 'Other']

export default function MaterialsSection({ isAuthenticated, onRequireAuth, toast }) {
  const [materials, setMaterials] = useState([])
  const [year, setYear] = useState('All years')
  const [subject, setSubject] = useState('All subjects')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', subject: '', academicYear: '1st year', materialType: 'PDF', resourceUrl: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => materialApi.list().then(setMaterials).catch(() => setMaterials([])), [])
  useEffect(() => { load() }, [load])
  const subjects = useMemo(() => ['All subjects', ...new Set(materials.map((item) => item.subject).filter(Boolean))], [materials])
  const visible = materials.filter((item) => (year === 'All years' || item.academicYear === year) && (subject === 'All subjects' || item.subject === subject))

  function openUpload() { if (!isAuthenticated) onRequireAuth(); else setUploadOpen(true) }
  async function submit(event) {
    event.preventDefault(); setLoading(true)
    if (file && file.size > 10 * 1024 * 1024) { toast('Please choose a PDF smaller than 10 MB.'); setLoading(false); return }
    try { await materialApi.create(form, file); setUploadOpen(false); setFile(null); setForm({ title: '', description: '', subject: '', academicYear: '1st year', materialType: 'PDF', resourceUrl: '' }); toast('Study material shared with the campus.'); load() }
    catch (error) { toast(error.message) } finally { setLoading(false) }
  }

  return <section className="materials-section" id="free-materials">
    <div className="materials-intro"><img src="/images/categories/free-materials.png" alt="Tablet, notebook and lecture resource card" /><div><span>Free knowledge shelf</span><h2>Notes should travel further than one semester.</h2><p>Share PDFs, lecture playlists, revision sheets and useful links, organised by year and subject.</p><button type="button" onClick={openUpload}><Plus size={17} /> Add free material</button></div></div>
    <div className="materials-library"><div className="library-toolbar"><div><BookOpenCheck size={22} /><div><strong>Community library</strong><span>{visible.length} free resources</span></div></div><div><select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter material year">{years.map((item) => <option key={item}>{item}</option>)}</select><select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter material subject">{subjects.map((item) => <option key={item}>{item}</option>)}</select></div></div>
      {visible.length ? <div className="material-grid">{visible.map((item) => <article key={item.id}><span className={item.materialType === 'YOUTUBE' ? 'video' : ''}>{item.materialType === 'YOUTUBE' ? <Play size={18} /> : <FileText size={18} />}{item.materialType}</span><h3>{item.title}</h3><p>{item.description || `${item.subject} learning resource`}</p><div><small>{item.subject} · {item.academicYear}</small><small>By {item.ownerName}</small></div><a href={item.fileName ? materialApi.downloadUrl(item.id) : item.resourceUrl} target="_blank" rel="noreferrer">Open resource <ExternalLink size={15} /></a></article>)}</div> : <div className="resource-empty"><FileText size={25} /><strong>No resources match these filters yet.</strong><span>Be the first student to add one.</span></div>}
    </div>
    {uploadOpen && <div className="modal-backdrop"><section className="resource-modal"><div className="modal-heading"><div><span>Community contribution</span><h2>Share free study material</h2></div><button className="modal-close static" onClick={() => setUploadOpen(false)} aria-label="Close"><X size={19} /></button></div><form onSubmit={submit}><div className="form-grid"><label className="field full"><span>Title</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Engineering Mathematics revision notes" /></label><label className="field"><span>Subject</span><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" /></label><label className="field"><span>Study year</span><select value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })}>{years.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Resource type</span><select value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value })}><option>PDF</option><option>YOUTUBE</option><option>LINK</option><option>NOTES</option></select></label><label className="field"><span>YouTube or web link</span><input type="url" disabled={form.materialType === 'PDF'} value={form.resourceUrl} onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })} placeholder="https://" /></label><label className="field full"><span>Description</span><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this resource covers" /></label>{form.materialType === 'PDF' && <label className="pdf-upload full"><Upload size={20} /><span>{file?.name || 'Choose a PDF (max 10 MB)'}</span><input required type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0])} /></label>}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setUploadOpen(false)}>Cancel</button><button className="primary-button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : 'Share resource'}</button></div></form></section></div>}
  </section>
}


