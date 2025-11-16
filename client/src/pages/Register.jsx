import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.register(form)
      login(data)
      nav('/')
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 md:px-10 py-12">
      <h1 className="font-display text-3xl md:text-4xl mb-6">Crear cuenta</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input name="name" value={form.name} onChange={onChange} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div className="flex items-center gap-3">
          <button disabled={loading} className="btn-primary disabled:opacity-60">{loading ? 'Creando…' : 'Crear cuenta'}</button>
          <Link to="/login" className="link-underline">Ya tengo cuenta</Link>
        </div>
      </form>
    </main>
  )
}
