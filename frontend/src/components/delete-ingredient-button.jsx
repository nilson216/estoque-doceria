import { Archive } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { protectedApi, publicApi } from '@/lib/axios'

const DeleteIngredientButton = ({ ingredientId, onDeleted, onUpdated } = {}) => {
  const [open, setOpen] = useState(false)
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
        const { data } = await publicApi.get(`/ingredients/${ingredientId}`)
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

      // If backend returned updated ingredient and its stock reached 0, delete the ingredient from DB
      // (this will also remove related movements on the server according to backend logic).
      if (updatedIngredient && Number(updatedIngredient.stockQuantity) === 0) {
        try {
          // attempt to delete the ingredient record from the backend
          await protectedApi.delete(`/ingredients/${ingredientId}`)
          toast.success('Saída registrada e ingrediente removido')
          setOpen(false)
          if (typeof onDeleted === 'function') onDeleted(ingredientId)
          if (createdMovement && typeof onUpdated === 'function') onUpdated({ ...updatedIngredient, _lastMovement: createdMovement })
          // dispatch global events so other parts of the UI can react without reload
          try { window.dispatchEvent(new CustomEvent('ingredient:removed', { detail: { id: ingredientId } })) } catch { /* ignore */ }
          if (createdMovement) {
            try { window.dispatchEvent(new CustomEvent('movement:created', { detail: { movement: createdMovement } })) } catch { /* ignore */ }
          }
          return
        } catch (err) {
          console.error('Failed to delete ingredient after stock reached 0', err)
          // fallback: if delete failed, still remove from UI to reflect zero stock, but notify user
          toast.error('Saída registrada, porém falha ao remover ingrediente do servidor')
          setOpen(false)
          if (typeof onDeleted === 'function') onDeleted(ingredientId)
          if (createdMovement && typeof onUpdated === 'function') onUpdated({ ...updatedIngredient, _lastMovement: createdMovement })
          try { window.dispatchEvent(new CustomEvent('ingredient:removed', { detail: { id: ingredientId } })) } catch { /* ignore */ }
          if (createdMovement) {
            try { window.dispatchEvent(new CustomEvent('movement:created', { detail: { movement: createdMovement } })) } catch { /* ignore */ }
          }
          return
        }
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
              <div className="px-2">
                  {/* Slider somente: usamos defaultValue para tornar o slider não-controlado e
                      evitar situações em que o valor controlado trava em 1. O onValueChange
                      ainda atualiza `amount` para enviar ao backend. */}
                  <Slider
                    defaultValue={[amount]}
                    onValueChange={(v) => setAmount(Number(v[0] ?? 0))}
                    min={1}
                    max={Math.max(1, Number(ingredient.stockQuantity || 0))}
                    step={1}
                  />
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
