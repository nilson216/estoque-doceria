import { Edit } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { publicApi } from '@/lib/axios'

const EditIngredientButton = ({ ingredient, onUpdated } = {}) => {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // local form state initialized from ingredient
  const [name, setName] = useState(ingredient?.name || '')
  const [unit, setUnit] = useState(ingredient?.unit || '')
  const [stockQuantity, setStockQuantity] = useState(ingredient?.stockQuantity ?? 0)
  const [observacao, setObservacao] = useState(ingredient?.observacao || '')
  const [expiryDate, setExpiryDate] = useState(ingredient?.expiryDate ? new Date(ingredient.expiryDate).toISOString().slice(0,10) : '')

  const resetState = () => {
    setName(ingredient?.name || '')
    setUnit(ingredient?.unit || '')
    setStockQuantity(ingredient?.stockQuantity ?? 0)
    setObservacao(ingredient?.observacao || '')
    setExpiryDate(ingredient?.expiryDate ? new Date(ingredient.expiryDate).toISOString().slice(0,10) : '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const payload = {
        name,
        unit,
        expiryDate: expiryDate || null,
        observacao: observacao || null,
      }
      const res = await publicApi.put(`/ingredients/${ingredient.id}`, payload)
      toast.success('Ingrediente atualizado')
      setOpen(false)
      if (typeof onUpdated === 'function') onUpdated(res.data)
    } catch (err) {
      console.error('Update ingredient error', err.response || err)
      const message = err?.response?.data?.message || 'Erro ao atualizar ingrediente'
      toast.error(typeof message === 'string' ? message : 'Erro ao atualizar ingrediente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) resetState() }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Editar">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ingrediente</DialogTitle>
          <DialogDescription>Altere os dados e salve as alterações.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4 py-2" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-2">
            <Label htmlFor={`name-${ingredient.id}`}>Nome</Label>
            <Input id={`name-${ingredient.id}`} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`unit-${ingredient.id}`}>Unidade</Label>
            <Select name={`unit-${ingredient.id}`} value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">KG</SelectItem>
                <SelectItem value="g">Gramas (g)</SelectItem>
                <SelectItem value="ml">ML</SelectItem>
                <SelectItem value="un">Unidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
           <Label htmlFor={`stock-${ingredient.id}`}>Quantidade (gerenciada por movimentações)</Label>
           <Input id={`stock-${ingredient.id}`} type="number" value={stockQuantity} disabled readOnly />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`expiry-${ingredient.id}`}>Data de Validade</Label>
            <Input id={`expiry-${ingredient.id}`} type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor={`observacao-${ingredient.id}`}>Observação do Ingrediente (opcional)</Label>
            <textarea id={`observacao-${ingredient.id}`} value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full border p-2 rounded" rows={2} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditIngredientButton
