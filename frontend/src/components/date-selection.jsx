import { format, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { DatePickerWithRange } from "./ui/date-picker-with-range"

export const DateSelection = () => {
  const navigate = useNavigate()
  
  // 1️⃣ Ler parâmetros da URL ou usar valores padrão
  const searchParams = new URLSearchParams(window.location.search)
  const initialFrom = searchParams.get("from")
  const initialTo = searchParams.get("to")

  // Converter strings para Date objects
  const [date, setDate] = useState({
    from: initialFrom ? parseISO(initialFrom) : new Date(), // ou uma data padrão
    to: initialTo ? parseISO(initialTo) : new Date(), // ou uma data padrão
  })

  // 2️⃣ Atualizar a URL quando o estado mudar
  useEffect(() => {
    if (!date.from || !date.to) return

    const formattedFrom = format(date.from, "yyyy-MM-dd")
    const formattedTo = format(date.to, "yyyy-MM-dd")
    
    const currentParams = new URLSearchParams(window.location.search)
    
    // Evitar navegar se já estiver igual
    if (currentParams.get("from") === formattedFrom && 
        currentParams.get("to") === formattedTo) return
        
    navigate(`?from=${formattedFrom}&to=${formattedTo}`, { replace: true })
  }, [date, navigate])

  return <DatePickerWithRange value={date} onChange={setDate} />
}

export default DateSelection