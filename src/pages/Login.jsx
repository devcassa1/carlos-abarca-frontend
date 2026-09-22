import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function Login() {
  const { isAuthenticated, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(username.trim(), password)
      const target = location.state?.from ?? '/'
      navigate(target, { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 422) {
        const details = err.response?.data?.errors
        if (details?.user || details?.password) {
          setError('Credenciales incorrectas.')
        } else {
          setError('Verifique los campos del formulario.')
        }
      } else {
        setError('No se pudo conectar con el servidor. Intente nuevamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-line-soft bg-canvas px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/30'

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-line bg-gradient-to-b from-panel-2 to-panel p-8 shadow-2xl shadow-black/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-base font-bold text-ink ring-1 ring-line-soft">
            CA
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-ink">Iniciar sesion</h1>
          <p className="mt-1 text-sm text-muted">
            Ingrese sus credenciales para acceder al sistema.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-ink">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="user" className="mb-1 block text-sm font-medium text-soft">
                Usuario
              </label>
              <input
                id="user"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-soft">
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>

      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <img
          src="/login-hero.jpg"
          alt="Cultivos en el campo"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-canvas/10" />
      </div>
    </div>
  )
}

export default Login