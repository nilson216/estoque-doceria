import { useState } from 'react'

import { protectedApi } from '@/lib/axios'

const CreateMovementModal = ({ open, onClose, ingredient, onCreated } = {}) => {
  const [type, setType] = useState('ENTRADA')
  const [quantity, setQuantity] = useState('')
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const submit = async () => {
    if (!ingredient) return
    setLoading(true)
    try {
      // POST to ingredients/:id/movements (requires auth)
      await protectedApi.post(`/ingredients/${ingredient.id}/movements`, { type, quantity: Number(quantity), observacao: observacao || undefined })
      onCreated && onCreated()
    } catch (err) {
      console.error('Failed create movement', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[520px] p-6">
        <h3 className="text-lg font-semibold">Nova Movimentação - {ingredient?.name}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm block mb-1">Tipo</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border p-2 rounded">
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Quantidade</label>
            <input value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm block mb-1">Observação (opcional)</label>
          <textarea value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full border p-2 rounded" rows={3} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
          <button onClick={submit} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  )
}

export default CreateMovementModal
