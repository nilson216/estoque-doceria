import { PlusIcon } from "lucide-react";

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

const AddIngredientButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">
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
        <form className="space-y-4 py-2">
          {/* Nome */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Ex: Farinha" required />
          </div>

          {/* Unidade */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Select name="unit">
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

          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIngredientButton;
