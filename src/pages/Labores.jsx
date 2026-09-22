import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { formatMoney } from '../utils/format'

function Labores() {
  const [labores, setLabores] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorForm, setErrorForm] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [onlyActive, setOnlyActive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deletingLabor, setDeletingLabor] = useState(null)
  const [filters, setFilters] = useState({
    cultivo_id: '',
    responsable_id: '',
    desde: '',
    hasta: '',
  })
  const [form, setForm] = useState({
    cultivo_id: '',
    responsable_id: '',
    tipo: '',
    descripcion: '',
    fecha: '',
    costo: '',
  })

  useEffect(() => {
    loadLabores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cultivo_id, filters.responsable_id, filters.desde, filters.hasta])

  useEffect(() => {
    api
      .get('/cultivos')
      .then((res) => {
        const items = res.data.data || []
        setCultivos(
          [...items].sort((a, b) => a.nombre.localeCompare(b.nombre))
        )
      })
      .catch(() => {})
  }, [])

  const responsables = useMemo(() => {
    const mapa = new Map()
    labores.forEach((labor) => {
      if (labor.responsable) {
        mapa.set(labor.responsable.id, labor.responsable)
      }
    })
    return Array.from(mapa.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    )
  }, [labores])

  const visibleLabores = useMemo(
    () => (onlyActive ? labores.filter((l) => l.estatus) : labores),
    [labores, onlyActive]
  )

  function loadLabores() {
    setLoading(true)
    setError('')
    const params = {}
    if (filters.cultivo_id) params.cultivo_id = filters.cultivo_id
    if (filters.responsable_id) params.responsable_id = filters.responsable_id
    if (filters.desde) params.desde = filters.desde
    if (filters.hasta) params.hasta = filters.hasta
    api
      .get('/labores', { params })
      .then((res) => {
        setLabores(res.data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar las labores. Intente nuevamente.')
        setLoading(false)
      })
  }

  function openCreate() {
    setEditing(null)
    setForm({
      cultivo_id: cultivos.length ? String(cultivos[0].id) : '',
      responsable_id: '',
      tipo: '',
      descripcion: '',
      fecha: '',
      costo: '',
    })
    setErrorForm('')
    setModalOpen(true)
  }

  function openEdit(labor) {
    setEditing(labor)
    setForm({
      cultivo_id: String(labor.cultivo_id),
      responsable_id:
        labor.responsable_id === null || labor.responsable_id === undefined
          ? ''
          : String(labor.responsable_id),
      tipo: labor.tipo,
      descripcion: labor.descripcion || '',
      fecha: labor.fecha || '',
      costo:
        labor.costo === null || labor.costo === undefined
          ? ''
          : String(labor.costo),
    })
    setErrorForm('')
    setModalOpen(true)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  function clearFilters() {
    setFilters({ cultivo_id: '', responsable_id: '', desde: '', hasta: '' })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrorForm('')

    const payload = {
      cultivo_id: form.cultivo_id,
      responsable_id: form.responsable_id || null,
      tipo: form.tipo,
      descripcion: form.descripcion || null,
      fecha: form.fecha,
      costo: form.costo || null,
    }

    const request = editing
      ? api.put(`/labores/${editing.id}`, payload)
      : api.post('/labores', payload)

    request
      .then(() => {
        setModalOpen(false)
        loadLabores()
      })
      .catch((err) => {
        const errors = err.response?.data?.errors
        setErrorForm(
          errors
            ? Object.values(errors).flat().join(' ')
            : 'No se pudo guardar la labor. Intente nuevamente.'
        )
      })
      .finally(() => setSaving(false))
  }

  function toggleStatus(labor) {
    api
      .put(`/labores/${labor.id}`, {
        cultivo_id: labor.cultivo_id,
        responsable_id: labor.responsable_id,
        tipo: labor.tipo,
        descripcion: labor.descripcion,
        fecha: labor.fecha,
        costo: labor.costo,
        estatus: labor.estatus ? 0 : 1,
      })
      .then(() => loadLabores())
      .catch(() => setError('No se pudo actualizar el estado de la labor.'))
  }

  function confirmDelete() {
    if (!deletingLabor) return
    setDeleting(true)
    api
      .delete(`/labores/${deletingLabor.id}`)
      .then(() => {
        setDeletingLabor(null)
        loadLabores()
      })
      .catch(() => {
        setDeletingLabor(null)
        setError('No se pudo eliminar la labor. Intente nuevamente.')
      })
      .finally(() => setDeleting(false))
  }

  const filterInputClass =
    'w-full rounded-lg border border-line-soft bg-canvas px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent'

  const inputClass =
    'w-full rounded-lg border border-line-soft bg-canvas px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Labores</h1>
          <p className="mt-1 text-muted">
            Registro de labores agricolas realizadas en los cultivos.
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
            Solo activas
          </label>
          <button
            onClick={openCreate}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent-deep"
          >
            Nueva labor
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-ink">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-line bg-panel p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-soft">Cultivo</label>
            <select
              name="cultivo_id"
              value={filters.cultivo_id}
              onChange={handleFilterChange}
              className={filterInputClass}
            >
              <option value="">Todos</option>
              {cultivos.map((cultivo) => (
                <option key={cultivo.id} value={cultivo.id}>
                  {cultivo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-soft">Responsable</label>
            <select
              name="responsable_id"
              value={filters.responsable_id}
              onChange={handleFilterChange}
              className={filterInputClass}
            >
              <option value="">Todos</option>
              {responsables.map((responsable) => (
                <option key={responsable.id} value={responsable.id}>
                  {responsable.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-soft">Desde</label>
            <input
              name="desde"
              type="date"
              value={filters.desde}
              onChange={handleFilterChange}
              className={filterInputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-soft">Hasta</label>
            <input
              name="hasta"
              type="date"
              value={filters.hasta}
              onChange={handleFilterChange}
              className={filterInputClass}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full rounded-lg border border-line-soft bg-panel-2 px-4 py-2 text-sm font-medium text-soft transition-colors hover:bg-line hover:text-ink"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-panel-2">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Cultivo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Descripcion</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Costo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Responsable</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-sm text-muted">Cargando...</td>
              </tr>
            ) : visibleLabores.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-sm text-muted">No hay labores registradas.</td>
              </tr>
            ) : (
              visibleLabores.map((labor) => {
                const cultivo = labor.cultivo
                const nombreCultivo =
                  cultivo?.nombre ?? `Cultivo ${labor.cultivo_id}`
                const trail = [
                  cultivo?.lote?.hacienda?.nombre,
                  cultivo?.lote?.nombre,
                ]
                  .filter(Boolean)
                  .join(' - ')
                return (
                  <tr key={labor.id} className="transition-colors hover:bg-panel-2">
                    <td className="px-4 py-3 text-sm font-medium text-ink">{labor.tipo}</td>
                    <td className="px-4 py-3 text-sm text-soft">
                      <div className="font-medium text-ink">{nombreCultivo}</div>
                      {trail && (
                        <div className="text-xs text-muted">{trail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-soft">{labor.descripcion || '-'}</td>
                    <td className="px-4 py-3 text-sm text-soft">{labor.fecha || '-'}</td>
                    <td className="px-4 py-3 text-sm text-soft">{formatMoney(labor.costo)}</td>
                    <td className="px-4 py-3 text-sm text-soft">{labor.responsable?.nombre ?? '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(labor)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          labor.estatus
                            ? 'bg-accent-green/20 text-neon'
                            : 'bg-panel-2 text-muted'
                        }`}
                        title="Cambiar estado"
                      >
                        {labor.estatus ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEdit(labor)}
                          className="rounded-lg border border-line-soft px-3 py-1 text-sm font-medium text-soft transition-colors hover:bg-panel-2 hover:text-ink"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeletingLabor(labor)}
                          className="rounded-lg border border-danger/30 px-3 py-1 text-sm font-medium text-danger-ink transition-colors hover:bg-danger/10"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold text-ink">
              {editing ? 'Editar labor' : 'Nueva labor'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {errorForm && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-ink">
                  {errorForm}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-soft">Cultivo</label>
                  <select
                    name="cultivo_id"
                    value={form.cultivo_id}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Seleccione un cultivo</option>
                    {cultivos.map((cultivo) => (
                      <option key={cultivo.id} value={cultivo.id}>
                        {cultivo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-soft">Responsable</label>
                  <select
                    name="responsable_id"
                    value={form.responsable_id}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Sin asignar</option>
                    {responsables.map((responsable) => (
                      <option key={responsable.id} value={responsable.id}>
                        {responsable.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-soft">Tipo de labor</label>
                <input
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  required
                  maxLength={80}
                  placeholder="Ej: Riego, Fumigacion, Cosecha"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-soft">Descripcion</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Detalle de la labor realizada"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-soft">Fecha</label>
                  <input
                    name="fecha"
                    type="date"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-soft">Costo</label>
                  <input
                    name="costo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.costo}
                    onChange={handleChange}
                    placeholder="Ej: 250000.00"
                    className={inputClass}
                  />
                </div>
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
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear labor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingLabor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold text-ink">Eliminar labor</h2>
            <p className="mt-2 text-sm text-soft">
              Esta accion eliminara permanentemente la labor{' '}
              <span className="font-semibold text-ink">{deletingLabor.tipo}</span>
              {' '}del {deletingLabor.fecha}. Esta operacion no se puede deshacer.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeletingLabor(null)}
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

export default Labores