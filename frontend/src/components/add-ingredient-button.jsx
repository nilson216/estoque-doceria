import { PlusIcon } from "lucide-react";
import { useState } from "react";
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
      // Use protectedApi so Authorization is sent; backend optionalAuth will use userId when present
      const res = await protectedApi.post("/ingredients", payload);
      const created = res.data
      toast.success("Ingrediente criado com sucesso");
      setOpen(false);
      form.reset();
      if (typeof onCreated === "function") onCreated(created);
      else window.location.reload();
    } catch (err) {
      console.error('Create ingredient error', err.response || err);
      const message = err?.response?.data?.message || err?.response?.data || "Erro ao criar ingrediente";
      toast.error(typeof message === 'string' ? message : 'Erro ao criar ingrediente');
    } finally {
      setSubmitting(false);
    }
  };

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
            <Input id="expiryDate" name="expiryDate" type="date" />
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
