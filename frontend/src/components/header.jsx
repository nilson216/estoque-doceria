import { ChevronDownIcon, LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/contexts/auth"

import logo from "../assets/images/image.png"
import { Card, CardContent } from "./ui/card"

export const Header = () => {
  const { user, signOut } = useAuthContext()

  return (
    <Card>
      <CardContent className="px-4 sm:px-8 py-4">
        <header className="flex items-center justify-between flex-wrap gap-2">
          
          <img src={logo} alt="Logo" className="h-10 sm:h-12" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
           <Button variant="outline" className="space-x-2">
            <Avatar className="avatar-custom h-8 w-8 rounded-full overflow-hidden">
                <AvatarImage
                src="../../public/avatarUrl.png"
                className="rounded-full object-cover"
                />
                <AvatarFallback className="rounded-full">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm">{user.firstName} {user.lastName}</p>
            <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>

              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Configurações</DropdownMenuLabel>
            </DropdownMenuContent>

          </DropdownMenu>

        </header>
      </CardContent>
    </Card>
  )
}
