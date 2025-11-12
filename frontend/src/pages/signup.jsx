import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import PasswordInput from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'O e-mail é obrigatório' })
    .email({ message: 'E-mail inválido' }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
})

const LoginPage = () => {
  const methods = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = (data) => {
    console.log(data)
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3">
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Card className="w-[500px] border-none bg-transparent p-2 shadow-none">
            <CardHeader className="text-center">
              <CardTitle>Entre na sua conta</CardTitle>
              <CardDescription>Insira seus dados abaixo.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Email Field */}
              <FormField
                name="email"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu e-mail"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                name="password"
                control={methods.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PasswordInput
                        placeholder="Digite sua senha"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full">
                Fazer Login
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <div className="flex items-center justify-center">
        <p className="text-center opacity-50">Não possui uma conta?</p>
        <Button variant="link" asChild>
          <Link to="/signup">Crie uma conta</Link>
        </Button>
      </div>
    </div>
  )
}

export default LoginPage