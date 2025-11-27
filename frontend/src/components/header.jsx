import { ChevronDownIcon, LogOutIcon, Menu, X } from "lucide-react"
import { useState } from 'react'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Card>
      <CardContent className="px-4 sm:px-8 py-4">
        <header className="flex items-center justify-between flex-wrap gap-2">
          
          <img src={logo} alt="Logo" className="h-10 sm:h-12" />

          <div className="flex items-center gap-2">
            <div className="sm:hidden">
              <button onClick={() => setMobileOpen(v => !v)} aria-label="Menu" className="p-2 rounded-md border">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

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
            <p className="text-sm hidden sm:inline-block">{user.firstName} {user.lastName}</p>
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
          </div>

          {/* Mobile menu panel */}
          {mobileOpen && (
            <div className="sm:hidden w-full mt-2">
              <div className="bg-white border rounded-md shadow-sm py-2 px-3">
                <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                <div className="mt-2">
                  <button onClick={() => { setMobileOpen(false); signOut() }} className="w-full text-left px-2 py-1 text-sm text-red-600">Sair</button>
                </div>
              </div>
            </div>
          )}

        </header>
      </CardContent>
    </Card>
  )
}
