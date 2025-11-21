import { useEffect, useState } from 'react'

import { publicApi } from '@/lib/axios'

const Card = ({ title, value, className }) => (
  <div className={`p-4 rounded-lg shadow-sm bg-white border ${className}`}>
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-bold">{value}</div>
  </div>
)

const MovementSummaryCards = ({ ingredientId, refreshSignal }) => {
  const [totals, setTotals] = useState({ entradas: 0, saidas: 0, net: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        // fetch movements with a high limit and compute totals client-side
        const res = await publicApi.get(`/ingredients/${ingredientId}/movements?page=1&limit=1000`)
        const items = res.data.items || []
        const entradas = items.filter(m => m.type === 'ENTRADA').reduce((s, m) => s + (m.quantity || 0), 0)
        const saidas = items.filter(m => m.type === 'SAIDA').reduce((s, m) => s + (m.quantity || 0), 0)
        if (!mounted) return
        setTotals({ entradas, saidas, net: entradas - saidas })
      } catch (err) {
        console.error('Failed to load movements summary', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (ingredientId) load()
    return () => { mounted = false }
  }, [ingredientId, refreshSignal])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <Card title="Total em Estoque" value={<span className="text-lg">(ver acima)</span>} />
      <Card title="Entradas" value={<span className="text-green-600">{loading ? '...' : totals.entradas}</span>} className="border-green-200" />
      <Card title="Saídas" value={<span className="text-red-600">{loading ? '...' : totals.saidas}</span>} className="border-red-200" />
      <Card title="Saldo" value={<span className="text-gray-800">{loading ? '...' : totals.net}</span>} className="border-indigo-200" />
    </div>
  )
}

export default MovementSummaryCards
