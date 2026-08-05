import { ArrowRight, Eye, EyeOff, GraduationCap, LoaderCircle, LockKeyhole, Mail, School, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'

export default function AuthModal({ onClose, initialMode = 'login', onSuccess }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', collegeEmail: '', password: '', institution: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password })
      else await register(form)
      onSuccess?.(); onClose()
    } catch (requestError) {
      setError(requestError.message || 'We could not complete that request.')
    } finally { setLoading(false) }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close authentication"><X size={20} /></button>
      <div className="auth-aside">
        <span className="auth-mark"><GraduationCap size={23} /></span>
        <p>Made for campus life</p>
        <h2>Good finds stay inside the student community.</h2>
        <ul><li>Save and manage your cart</li><li>Contact verified student sellers</li><li>List materials in under two minutes</li></ul>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Create account</button></div>
        <span className="form-eyebrow">Student account</span>
        <h2 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Join CampusBaazar'}</h2>
        <p>{mode === 'login' ? 'Sign in to continue your campus shopping.' : 'Create one account for buying and selling.'}</p>
        <form onSubmit={submit}>
          {mode === 'register' && <label className="auth-field"><span>Full name</span><div><UserRound size={18} /><input required minLength="2" value={form.name} onChange={update('name')} placeholder="Your name" /></div></label>}
          <label className="auth-field"><span>{mode === 'login' ? 'Personal or college email' : 'Personal email'}</span><div><Mail size={18} /><input required type="email" value={form.email} onChange={update('email')} placeholder={mode === 'login' ? 'Your registered email' : 'Your personal email'} /></div></label>
          {mode === 'register' && <label className="auth-field"><span>College email ID</span><div><GraduationCap size={18} /><input required type="email" value={form.collegeEmail} onChange={update('collegeEmail')} placeholder="name@yourcollege.edu" /></div></label>}
          {mode === 'register' && <label className="auth-field"><span>College or school</span><div><School size={18} /><input required value={form.institution} onChange={update('institution')} placeholder="Your institution" /></div></label>}
          <label className="auth-field"><span>Password</span><div><LockKeyhole size={18} /><input required minLength={mode === 'register' ? 8 : 1} type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {error && <p className="form-error">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={19} /> : <>{mode === 'login' ? 'Sign in' : 'Create my account'}<ArrowRight size={18} /></>}</button>
        </form>
        <p className="auth-switch">{mode === 'login' ? 'New to CampusBaazar?' : 'Already have an account?'} <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
      </div>
    </section>
  </div>
}
