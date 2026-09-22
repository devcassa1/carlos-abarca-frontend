import { useEffect, useState } from 'react'
import api from '../api/client'

function Cultivos() {
  const [cultivos, setCultivos] = useState([])
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorForm, setErrorForm] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [onlyActive, setOnlyActive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deletingCultivo, setDeletingCultivo] = useState(null)
  const [form, setForm] = useState({
    lote_id: '',
    nombre: '',
    variedad: '',
    fecha_siembra: '',
    fecha_cosecha_estimada: '',
    area_sembrada: '',
  })

  useEffect(() => {
    loadCultivos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyActive])

  useEffect(() => {
    api
      .get('/lotes')
      .then((res) => {
        const items = res.data.data || []
        setLotes(
          items
            .filter((l) => l.estatus)
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        )
      })
      .catch(() => {})
  }, [])

  function loadCultivos() {
    setLoading(true)
    setError('')
    api
      .get('/cultivos', { params: onlyActive ? { activos: 1 } : {} })
      .then((res) => {
        setCultivos(res.data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar los cultivos. Intente nuevamente.')
        setLoading(false)
      })
  }

  function openCreate() {
    setEditing(null)
    setForm({
      lote_id: lotes.length ? String(lotes[0].id) : '',
      nombre: '',
      variedad: '',
      fecha_siembra: '',
      fecha_cosecha_estimada: '',
      area_sembrada: '',
    })
    setErrorForm('')
    setModalOpen(true)
  }

  function openEdit(cultivo) {
    setEditing(cultivo)
    setForm({
      lote_id: String(cultivo.lote_id),
      nombre: cultivo.nombre,
      variedad: cultivo.variedad || '',
      fecha_siembra: cultivo.fecha_siembra || '',
      fecha_cosecha_estimada: cultivo.fecha_cosecha_estimada || '',
      area_sembrada: cultivo.area_sembrada === null || cultivo.area_sembrada === undefined ? '' : String(cultivo.area_sembrada),
    })
    setErrorForm('')
    setModalOpen(true)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrorForm('')

    const payload = {
      lote_id: form.lote_id,
      nombre: form.nombre,
      variedad: form.variedad || null,
      fecha_siembra: form.fecha_siembra || null,
      fecha_cosecha_estimada: form.fecha_cosecha_estimada || null,
      area_sembrada: form.area_sembrada || null,
    }

    const request = editing
      ? api.put(`/cultivos/${editing.id}`, payload)
      : api.post('/cultivos', payload)

    request
      .then(() => {
        setModalOpen(false)
        loadCultivos()
      })
      .catch((err) => {
        const errors = err.response?.data?.errors
        setErrorForm(
          errors
            ? Object.values(errors).flat().join(' ')
            : 'No se pudo guardar el cultivo. Intente nuevamente.'
        )
      })
      .finally(() => setSaving(false))
  }

  function toggleStatus(cultivo) {
    api
      .put(`/cultivos/${cultivo.id}`, {
        lote_id: cultivo.lote_id,
        nombre: cultivo.nombre,
        variedad: cultivo.variedad,
        fecha_siembra: cultivo.fecha_siembra,
        fecha_cosecha_estimada: cultivo.fecha_cosecha_estimada,
        area_sembrada: cultivo.area_sembrada,
        estatus: cultivo.estatus ? 0 : 1,
      })
      .then(() => loadCultivos())
      .catch(() => setError('No se pudo actualizar el estado del cultivo.'))
  }

  function confirmDelete() {
    if (!deletingCultivo) return
    setDeleting(true)
    api
      .delete(`/cultivos/${deletingCultivo.id}`)
      .then(() => {
        setDeletingCultivo(null)
        loadCultivos()
      })
      .catch(() => {
        setDeletingCultivo(null)
        setError('No se pudo eliminar el cultivo. Intente nuevamente.')
      })
      .finally(() => setDeleting(false))
  }

  const inputClass =
    'w-full rounded-lg border border-line-soft bg-canvas px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Cultivos</h1>
          <p className="mt-1 text-muted">
            Registro de cultivos asociados a cada lote.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-soft">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="h-4 w-4 rounded border-line-soft bg-canvas text-accent focus:ring-accent"
            />
            Solo activos
          </label>
          <button
            onClick={openCreate}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent-deep"
          >
            Nuevo cultivo
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-ink">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-panel-2">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Lote</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Variedad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Fecha siembra</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Cosecha estimada</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Area sembrada</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-sm text-muted">Cargando...</td>
              </tr>
            ) : cultivos.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-sm text-muted">No hay cultivos registrados.</td>
              </tr>
            ) : (
              cultivos.map((cultivo) => (
                <tr key={cultivo.id} className="transition-colors hover:bg-panel-2">
                  <td className="px-4 py-3 text-sm font-medium text-ink">{cultivo.nombre}</td>
                  <td className="px-4 py-3 text-sm text-soft">
                    {cultivo.lote?.nombre ?? `Lote ${cultivo.lote_id}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-soft">{cultivo.variedad || '-'}</td>
                  <td className="px-4 py-3 text-sm text-soft">{cultivo.fecha_siembra || '-'}</td>
                  <td className="px-4 py-3 text-sm text-soft">{cultivo.fecha_cosecha_estimada || '-'}</td>
                  <td className="px-4 py-3 text-sm text-soft">
                    {cultivo.area_sembrada === null || cultivo.area_sembrada === undefined
                      ? '-'
                      : `${cultivo.area_sembrada} ha`}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(cultivo)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        cultivo.estatus
                          ? 'bg-accent-green/20 text-neon'
                          : 'bg-panel-2 text-muted'
                      }`}
                      title="Cambiar estado"
                    >
                      {cultivo.estatus ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openEdit(cultivo)}
                        className="rounded-lg border border-line-soft px-3 py-1 text-sm font-medium text-soft transition-colors hover:bg-panel-2 hover:text-ink"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingCultivo(cultivo)}
                        className="rounded-lg border border-danger/30 px-3 py-1 text-sm font-medium text-danger-ink transition-colors hover:bg-danger/10"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold text-ink">
              {editing ? 'Editar cultivo' : 'Nuevo cultivo'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {errorForm && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-ink">
                  {errorForm}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-soft">Lote</label>
                <select
                  name="lote_id"
                  value={form.lote_id}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Seleccione un lote</option>
                  {lotes.map((lote) => (
                    <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-soft">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  placeholder="Ej: Maiz verano"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-soft">Variedad</label>
                <input
                  name="variedad"
                  value={form.variedad}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="Ej: DK 4400"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-soft">Fecha siembra</label>
                  <input
                    name="fecha_siembra"
                    type="date"
                    value={form.fecha_siembra}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-soft">Cosecha estimada</label>
                  <input
                    name="fecha_cosecha_estimada"
                    type="date"
                    min={form.fecha_siembra || undefined}
                    value={form.fecha_cosecha_estimada}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-soft">Area sembrada (ha)</label>
                <input
                  name="area_sembrada"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.area_sembrada}
                  onChange={handleChange}
                  placeholder="Ej: 40"
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg bg-panel-2 px-4 py-2 text-sm font-semibold text-soft transition-colors hover:bg-line hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent-deep disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear cultivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCultivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold text-ink">Eliminar cultivo</h2>
            <p className="mt-2 text-sm text-soft">
              Esta accion eliminara permanentemente el cultivo{' '}
              <span className="font-semibold text-ink">{deletingCultivo.nombre}</span>
              . Esta operacion no se puede deshacer.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeletingCultivo(null)}
                className="rounded-lg bg-panel-2 px-4 py-2 text-sm font-semibold text-soft transition-colors hover:bg-line hover:text-ink"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cultivos