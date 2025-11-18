import { Eye, EyeOffIcon } from 'lucide-react'
import { forwardRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PasswordInput = forwardRef(
  ({ placeholder = 'Digite sua senha', ...props }, ref) => {
    const [passwordIsVisible, setPasswordIsVisible] = useState(false)

    return (
      <div className="relative">
        <Input
          type={passwordIsVisible ? 'text' : 'password'}
          placeholder={placeholder}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          className="absolute bottom-0 right-0 top-0 my-auto mr-1 h-8 w-8 text-muted-foreground"
          variant="ghost"
          onClick={() => setPasswordIsVisible((prev) => !prev)}
        >
          {passwordIsVisible ? <EyeOffIcon /> : <Eye />}
        </Button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput