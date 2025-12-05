import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom'
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { protectedApi } from "@/lib/axios";

const AddIngredientButton = ({ onCreated } = {}) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [unit, setUnit] = useState('')
  const [observacao, setObservacao] = useState('')
  const [movementObservacao, setMovementObservacao] = useState('')
  const [mode, setMode] = useState('new') // 'new' or 'existing'
  const [existingIngredients, setExistingIngredients] = useState([])
  const [selectedIngredientId, setSelectedIngredientId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const stockQty = Number(formData.get("stockQuantity") || 0)
    const payload = {
      name: formData.get("name"),
      unit: unit || formData.get("unit"),
      observacao: observacao || undefined,
      stockQuantity: stockQty,
      expiryDate: formData.get("expiryDate") || null,
      initialMovement: stockQty > 0 ? { quantity: stockQty, type: 'ENTRADA', observacao: movementObservacao || undefined } : undefined,
    };

    try {
      setSubmitting(true);
      // If user chose to add to an existing ingredient, call the movements endpoint
      if (mode === 'existing' && selectedIngredientId) {
        const res = await protectedApi.post(`/ingredients/${selectedIngredientId}/movements`, {
          type: 'ENTRADA',
          quantity: stockQty,
          observacao: movementObservacao || undefined,
        });
        const result = res.data
        toast.success('Quantidade adicionada ao ingrediente existente');
        setOpen(false);
        form.reset();
        if (typeof onCreated === 'function') onCreated(result.updatedIngredient || result);
        else window.location.reload();
      } else {
        // Use protectedApi so Authorization is sent; backend optionalAuth will use userId when present
        const res = await protectedApi.post("/ingredients", payload);
        const created = res.data
        toast.success("Ingrediente criado com sucesso");
        setOpen(false);
        form.reset();
        if (typeof onCreated === "function") onCreated(created);
        else window.location.reload();
      }
    } catch (err) {
      console.error('Create ingredient error', err.response || err);
      const message = err?.response?.data?.message || err?.response?.data || "Erro ao criar ingrediente";
      toast.error(typeof message === 'string' ? message : 'Erro ao criar ingrediente');
    } finally {
      setSubmitting(false);
    }
  };

  const location = useLocation()

  useEffect(() => {
    // preload existing ingredients for selection when adding to existing
    const load = async () => {
      try {
        // Mirror the same query params used by the ingredients table so we only show
        // ingredients that are currently listed (respecting filters).
        const params = new URLSearchParams(location.search)
        const qs = new URLSearchParams()
        // copy pagination if present
        if (params.get('page')) qs.set('page', params.get('page'))
        if (params.get('limit')) qs.set('limit', params.get('limit'))
        // copy filters
        const createdFrom = params.get('createdFrom')
        const createdTo = params.get('createdTo')
        const expiryFrom = params.get('expiryFrom')
        const expiryTo = params.get('expiryTo')
        const nameParam = params.get('name')
        if (createdFrom) qs.set('createdFrom', createdFrom)
        if (createdTo) qs.set('createdTo', createdTo)
        if (expiryFrom) qs.set('expiryFrom', expiryFrom)
        if (expiryTo) qs.set('expiryTo', expiryTo)
        if (nameParam) qs.set('name', nameParam)
        
        if (!qs.get('limit')) qs.set('limit', '100')

        const res = await protectedApi.get(`/ingredients?${qs.toString()}`)
        setExistingIngredients(res.data.items || [])
      } catch (err) {
        // ignore silently; user can still create new
        console.error('Failed to load existing ingredients', err)
      }
    }
    if (open && mode === 'existing') load()
  }, [open, mode, location.search])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusIcon className="mr-2 h-4 w-4" />
          Novo Ingrediente
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Ingrediente</DialogTitle>
          <DialogDescription>
            Preencha os dados para registrar um novo ingrediente no estoque.
          </DialogDescription>
        </DialogHeader>

        {/* FORMULÁRIO */}
        <form className="space-y-4 py-2" onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Ex: Farinha" required />
          </div>

          {/* Unidade */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Select name="unit" value={unit} onValueChange={setUnit}>
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

          {/* Mode: new or existing */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" value="new" checked={mode === 'new'} onChange={() => setMode('new')} />
              <span className="text-sm">Criar novo</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" value="existing" checked={mode === 'existing'} onChange={() => setMode('existing')} />
              <span className="text-sm">Adicionar a existente</span>
            </label>
          </div>

          {mode === 'existing' && (
            <div className="flex flex-col space-y-2">
              <Label htmlFor="existing">Selecionar ingrediente</Label>
              <Select name="existing" value={selectedIngredientId || ''} onValueChange={(v) => setSelectedIngredientId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um ingrediente" />
                </SelectTrigger>
                <SelectContent>
                  {existingIngredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>{ing.name} — {ing.unit}{ing.expiryDate ? ` — Validade: ${String(ing.expiryDate).split('T')[0]}` : ''} (estoque: {ing.stockQuantity})</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantidade */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="stockQuantity">Quantidade Inicial</Label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              step="0.01"
              placeholder="0"
              required
            />
          </div>
          
          {/* Validade */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="expiryDate">Data de Validade</Label>
            <Input id="expiryDate" name="expiryDate" type="date" lang="pt-BR" />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="observacao">Observação do Ingrediente (opcional)</Label>
            <textarea id="observacao" name="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full border p-2 rounded" rows={2} />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="movementObservacao">Observação da Entrada Inicial (opcional)</Label>
            <textarea id="movementObservacao" name="movementObservacao" value={movementObservacao} onChange={(e) => setMovementObservacao(e.target.value)} className="w-full border p-2 rounded" rows={2} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIngredientButton;
