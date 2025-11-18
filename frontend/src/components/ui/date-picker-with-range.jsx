"use client"

import { format } from "date-fns"
import {ptBR} from 'date-fns/locale/pt-BR'
import { Calendar as CalendarIcon } from "lucide-react" // Removi o Dice1, pois não é usado na lógica de data

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"


// Nota: 'value' agora deve ser um objeto { from: Date, to: Date }
export const DatePickerWithRange = ({ value, onChange, className, placeholder = 'Selecione uma data ' }) => {

  return (
    <div className={cn('grid gap-2', className)}>
     <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"} // Reverti para o padrão do professor (outline)
          className={cn(
            'w-[300px] justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              // Intervalo completo
              <>
                {format(value.from, "LLL dd, y", { locale: ptBR })} -{" "}
                {format(value.to, "LLL dd, y", { locale: ptBR })}
              </>
            ) : (
              // Apenas a data de início selecionada
              format(value.from, "LLL dd, y", { locale: ptBR })
            )
          ) : (
            // Nenhuma data selecionada
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start"> {/* Adicionei align="start" */}
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
    </div>
  )
}