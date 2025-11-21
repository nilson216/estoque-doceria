import { format, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { DatePickerWithRange } from "./ui/date-picker-with-range"

// prefix: 'created' or 'expiry' — will store params like createdFrom/createdTo
export const DateSelection = ({ prefix = 'created', placeholder }) => {
  const navigate = useNavigate()

  const currentParams = new URLSearchParams(window.location.search)
  const keyFrom = `${prefix}From`
  const keyTo = `${prefix}To`

  const initialFrom = currentParams.get(keyFrom)
  const initialTo = currentParams.get(keyTo)

  const [date, setDate] = useState({
    from: initialFrom ? parseISO(initialFrom) : null,
    to: initialTo ? parseISO(initialTo) : null,
  })

  useEffect(() => {
    // Build params preserving existing ones
    const params = new URLSearchParams(window.location.search)

    // Guard if date is undefined/null
    const fromVal = date?.from || null
    const toVal = date?.to || null

    if (fromVal) {
      params.set(keyFrom, format(fromVal, 'yyyy-MM-dd'))
    } else {
      params.delete(keyFrom)
    }

    if (toVal) {
      params.set(keyTo, format(toVal, 'yyyy-MM-dd'))
    } else {
      params.delete(keyTo)
    }

    // Avoid unnecessary navigation
    if (params.toString() === currentParams.toString()) return

    navigate(`?${params.toString()}`, { replace: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, prefix])

  const handleChange = (v) => {
    if (!v) return setDate({ from: null, to: null })
    // v may be an object with { from, to }
    setDate(v)
  }

  return (
    <DatePickerWithRange
      value={date}
      onChange={handleChange}
      placeholder={placeholder}
    />
  )
}

export default DateSelection