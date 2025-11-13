import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/axios'

const signupSchema = z.object({
  firstName: z.string().trim().min(1, { message: 'O nome é obrigatório' }),
  lastName: z.string().trim().min(1, { message: 'O sobrenome é obrigatório' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'O e-mail é obrigatório' })
    .email({ message: 'E-mail inválido' }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
  passwordConfirmation: z
    .string()
    .trim()
    .min(6, { message: 'A confirmação de senha é obrigatória' }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de uso e política de privacidade',
  }),
})
.refine(
  (data) => data.password === data.passwordConfirmation,
  {
  message: 'As senhas não coincidem',
  path: ['passwordConfirmation'],
})


const SignupPage = () => {
  const [user, setUser] = useState(null)
  const signupMutation = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (variables) => {
      const response = await api.post('/users', {
        first_name: variables.firstName,
        last_name: variables.lastName,
        email: variables.email,
        password: variables.password,
      })
      return response.data
    },
  })
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      termsAccepted: false,
    },
  })
  useEffect(() => {
    const init = async () => {
      try {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      if (!accessToken && !refreshToken) return
      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setUser(response.data) 
      } catch(error) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        console.error('Error retrieving tokens from localStorage', error)
      } 
    }
    init()
  }, [])

  const handleSubmit = (data) => {
    signupMutation.mutate(data, {
      onSuccess: (createdUser) => {
        const accesToken = createdUser.access_token
        const refreshToken = createdUser.refresh_token
        setUser(createdUser)
        localStorage.setItem('accessToken', accesToken)
        localStorage.setItem('refreshToken', refreshToken)
        toast.success('Conta criada com sucesso!')
      },
      onError: () => {
        toast.error('Erro ao criar a conta. Tente novamente.')
      },
    })
  }
  if (user) {
    return <h1>Olá, {user.first_name}!</h1>
  }
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card className="w-[500px] border-none bg-transparent p-2 shadow-none">
            <CardHeader className="text-center">
              <CardTitle>Crie a sua conta</CardTitle>
              <CardDescription>Insira os seus dados abaixo.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/** First Name Field */}
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Digite seu nome"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/** Last Name Field */}
              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Digite seu sobrenome"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/** Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
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
              {/** Password Field */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
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
              {/** Password Confirmation Field */}
              <FormField
                name="passwordConfirmation"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmação de senha</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Digite sua senha novamente"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/** Terms and Conditions Checkbox */}
              <FormField
                name="termsAccepted"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="items-top flex gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="leading-none">
                      <Label
                        htmlFor="terms"
                        className={`text-xs text-muted-foreground opacity-75 ${form.formState.errors.termsAccepted && 'text-red-500'}`}
                      >
                        Ao clicar em &quot;Criar conta&quot;, você concorda com{' '}
                        <a
                          href="/"
                          className={`text-white underline ${form.formState.errors.termsAccepted && 'text-red-500'}`}
                        >
                          nosso termo de uso e política de privacidade.
                        </a>
                      </Label>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Criar Conta
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <div className="flex items-center justify-center">
        <p className="text-center opacity-50">Já possui uma conta?</p>
        <Button variant="link" asChild>
          <Link to="/login">Faça Login</Link>
        </Button>
      </div>
    </div>
  )
}

export default SignupPage