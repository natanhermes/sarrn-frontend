"use client";

import { KeyRoundIcon, LogOutIcon, MenuIcon, UserRoundIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PasswordChangeDialog } from "@/components/admin/password-change-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { clearAuthTokens } from "@/lib/auth-cookies";
import { roleLabels } from "@/schemas/users";
import { useAuth } from "@/store/useAuth";

function getInitials(name?: string) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminHeader() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  function handleLogout() {
    clearAuthTokens();
    logout();
    router.replace("/login");
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </Button>
            <SheetContent side="left" className="w-72 p-0" showCloseButton>
              <SheetHeader className="sr-only">
                <SheetTitle>Navegação</SheetTitle>
              </SheetHeader>
              <AdminSidebar
                className="w-full border-r-0"
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <p className="text-sm font-medium md:hidden">Painel Admin</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-40 truncate text-sm sm:inline">
                  {user?.name ?? "Usuário"}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {user?.name ?? "Usuário"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                  {user?.role && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <UserRoundIcon className="size-3" />
                      {roleLabels[user.role]}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
              <KeyRoundIcon className="size-4" />
              Alterar Senha
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOutIcon />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <PasswordChangeDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </>
  );
}
