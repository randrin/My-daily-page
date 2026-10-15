"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, LogOut } from "lucide-react";
import { firstLetterUppercase } from "@/utils";

interface UserProfileDropdownProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
}

export function UserProfileDropdown({
  firstName = "John",
  lastName = "Doe",
  email = "john.doe@example.com",
  avatarUrl,
  onEditProfile,
  onChangePassword,
  onLogout,
}: UserProfileDropdownProps) {
  const t = useTranslator();
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0).toUpperCase() || "";
    const lastInitial = lastName?.charAt(0).toUpperCase() || "";
    return firstInitial + lastInitial;
  };

  console.log(firstName, lastName);

  const fullName = [
    firstLetterUppercase(firstName),
    firstLetterUppercase(lastName),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0"
          aria-label="Menu du compte"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={onEditProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>
            <Localized>{t("messages.editProfile")}</Localized>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={onChangePassword}>
          <Lock className="mr-2 h-4 w-4" />
          <span>
            <Localized>{t("messages.changePassword")}</Localized>
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            <Localized>{t("messages.signOut")}</Localized>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
