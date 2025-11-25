import { Archive } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { protectedApi } from '@/lib/axios'

const DeleteIngredientButton = ({ ingredientId, onDeleted, onUpdated } = {}) => {
  const [open, setOpen] = useState(false)
  // `onDeleted` may be passed by parent but this component no longer deletes the ingredient
  // Keep a reference to avoid unused-variable lint errors
  void onDeleted
  const [submitting, setSubmitting] = useState(false)
  const [ingredient, setIngredient] = useState(null)
  const [loadingIngredient, setLoadingIngredient] = useState(false)
  const [amount, setAmount] = useState(1)
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    if (!open) return
        const load = async () => {
      try {
        setLoadingIngredient(true)
        const { data } = await protectedApi.get(`/ingredients/${ingredientId}`)
        setIngredient(data)
        const current = Number(data.stockQuantity || 0)
        // default amount to 1 when stock > 0, otherwise 0
        setAmount(current > 0 ? 1 : 0)
      } catch (err) {
        console.error('Failed to load ingredient', err.response || err)
        toast.error('Erro ao carregar ingrediente')
      } finally {
        setLoadingIngredient(false)
      }
    }
    load()
  }, [open, ingredientId])

  const handleConfirmRemove = async () => {
    if (!ingredient) return
    const qty = Number(amount)
    if (qty <= 0) return toast.error('Quantidade inválida')

    try {
      setSubmitting(true)
      // Create a SAIDA movement which will update ingredient stock atomically on the backend
        const resp = await protectedApi.post(`/ingredients/${ingredientId}/movements`, { quantity: qty, type: 'SAIDA', observacao: observacao || undefined })
      const createdMovement = resp.data?.createdMovement || resp.data?.movement || null
      const updatedIngredient = resp.data?.updatedIngredient || resp.data?.ingredient || resp.data || null

      // If backend returned updated ingredient and its stock reached 0, do NOT delete the ingredient record
      // This preserves the created SAIDA movement in the database so history is kept.
      if (updatedIngredient && Number(updatedIngredient.stockQuantity) === 0) {
        toast.success('Saída registrada e estoque zerado')
        setOpen(false)
        if (typeof onUpdated === 'function') onUpdated({ ...updatedIngredient, _lastMovement: createdMovement })
        // dispatch global events so other parts of the UI can react without reload
        try { window.dispatchEvent(new CustomEvent('ingredient:stockZero', { detail: { id: ingredientId } })) } catch { /* ignore */ }
        if (createdMovement) {
          try { window.dispatchEvent(new CustomEvent('movement:created', { detail: { movement: createdMovement } })) } catch { /* ignore */ }
        }
        return
      }

      // If updatedIngredient exists and was not deleted, notify parent to update the row
      if (updatedIngredient && typeof onUpdated === 'function') {
        onUpdated(updatedIngredient)
      }

      if (createdMovement) {
        toast.success(`Saída registrada (movimento ${createdMovement.id})`)
        // notify listeners about new movement so movements list can refresh
        try { window.dispatchEvent(new CustomEvent('movement:created', { detail: { movement: createdMovement } })) } catch { /* ignore */ }
      } else {
        toast.success('Saída registrada com sucesso')
      }
      setOpen(false)
    } catch (err) {
      console.error('Create SAIDA movement error', err.response || err)
      const message = err?.response?.data?.message || 'Erro ao registrar saída'
      toast.error(typeof message === 'string' ? message : 'Erro ao registrar saída')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Remover">
          <Archive className="h-4 w-4 text-red-600" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar saída</DialogTitle>
          <DialogDescription>
            {loadingIngredient && 'Carregando...'}
            {!loadingIngredient && ingredient && (
              <span>Remover unidades do ingrediente <strong>{ingredient.name}</strong>. Estoque atual: {ingredient.stockQuantity}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {!loadingIngredient && ingredient && (
          <div className="mt-4">
              <div className="mb-2 text-sm text-muted-foreground">Quantidade a remover: <strong>{amount}</strong></div>
              <div className="px-2 flex items-center gap-3">
                  <div className="flex-1">
                    {/* Controlled Slider: value is synchronized with `amount` */}
                    <Slider
                      value={[amount]}
                      onValueChange={(v) => setAmount(Number(v[0] ?? 0))}
                      min={1}
                      max={Math.max(1, Number(ingredient.stockQuantity || 0))}
                      step={1}
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      className="w-full border p-1 rounded text-sm"
                      value={amount}
                      min={1}
                      max={Math.max(1, Number(ingredient.stockQuantity || 0))}
                      onChange={(e) => {
                        const raw = e.target.value
                        // allow empty while typing
                        if (raw === '') {
                          setAmount(0)
                          return
                        }
                        let n = Number(raw)
                        if (Number.isNaN(n)) return
                        n = Math.trunc(n)
                        const max = Math.max(1, Number(ingredient.stockQuantity || 0))
                        if (n < 1) n = 1
                        if (n > max) n = max
                        setAmount(n)
                      }}
                    />
                  </div>
              </div>
                <div className="mt-4">
                  <label className="text-sm block mb-1">Observação (opcional)</label>
                  <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full border p-2 rounded" rows={3} />
                </div>
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmRemove} disabled={submitting || loadingIngredient || !ingredient} className="ml-2">{submitting ? 'Processando...' : 'Confirmar saída'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteIngredientButton
