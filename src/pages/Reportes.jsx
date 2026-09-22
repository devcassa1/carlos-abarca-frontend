import { useEffect, useState } from 'react'
import api from '../api/client'
import { formatMoney } from '../utils/format'

function Reportes() {
  const [reportes, setReportes] = useState({ por_hacienda: [], por_responsable: [], totales: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api
      .get('/reportes')
      .then((res) => {
        const data = res.data.data || {}
        setReportes({
          por_hacienda: data.por_hacienda || [],
          por_responsable: data.por_responsable || [],
          totales: data.totales || {},
        })
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar los reportes. Intente nuevamente.')
        setLoading(false)
      })
  }, [])

  function exportCsv() {
    setExporting(true)
    api
      .get('/reportes/exportar', { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.download = 'reporte_labores.csv'
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      })
      .catch(() => setError('No se pudo exportar el reporte. Intente nuevamente.'))
      .finally(() => setExporting(false))
  }

  const totales = reportes.totales

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Reportes</h1>
          <p className="mt-1 text-muted">
            Indicadores y resumenes del sistema.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-accent-deep disabled:opacity-50"
        >
          {exporting ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-ink">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-b from-panel-2 to-panel p-6">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neon/70 to-accent" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Haciendas activas
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold text-ink">
            {loading ? '-' : totales.haciendas ?? 0}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-b from-panel-2 to-panel p-6">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neon/70 to-accent" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Labores activas
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold text-ink">
            {loading ? '-' : totales.labores ?? 0}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-b from-panel-2 to-panel p-6">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neon/70 to-accent" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Costo total
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold text-neon">
            {loading ? '-' : formatMoney(totales.costo_total)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-base font-semibold text-ink">
            Resumen por hacienda
          </h2>
        </div>
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-panel-2">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">
                Hacienda
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">
                Lotes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">
                Cultivos
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">
                Labores
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted">
                Costo total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-sm text-muted">
                  Cargando...
                </td>
              </tr>
            ) : reportes.por_hacienda.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-sm text-muted">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              reportes.por_hacienda.map((hacienda) => (
                <tr key={hacienda.id} className="transition-colors hover:bg-panel-2">
                  <td className="px-4 py-3 text-sm font-medium text-ink">
                    {hacienda.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-soft">{hacienda.lotes}</td>
                  <td className="px-4 py-3 text-sm text-soft">{hacienda.cultivos}</td>
                  <td className="px-4 py-3 text-sm text-soft">{hacienda.labores}</td>
                  <td className="px-4 py-3 text-right text-sm text-soft">
                    {formatMoney(hacienda.costo_total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-base font-semibold text-ink">
            Resumen por responsable
          </h2>
        </div>
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-panel-2">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">
                Responsable
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted">
                Labores
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted">
                Costo total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-4 py-10 text-center text-sm text-muted">
                  Cargando...
                </td>
              </tr>
            ) : reportes.por_responsable.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-4 py-10 text-center text-sm text-muted">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              reportes.por_responsable.map((responsable) => (
                <tr key={responsable.id} className="transition-colors hover:bg-panel-2">
                  <td className="px-4 py-3 text-sm font-medium text-ink">
                    {responsable.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-soft">{responsable.labores}</td>
                  <td className="px-4 py-3 text-right text-sm text-soft">
                    {formatMoney(responsable.costo_total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reportes