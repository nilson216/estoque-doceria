import { PlusIcon } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from "./ui/button";



const AddIngredientButton = () => {
    return ( 
       <>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary">
              <PlusIcon className="mr-2 h-4 w-4" />
              Novo Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicioanar Ingredient</DialogTitle>
              <DialogDescription>
                Adicione uma nova Ingredient ao seu estoque.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
       </>
     );
}
 
export default AddIngredientButton;