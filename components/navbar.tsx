"use client"
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import NavbarAccount from "./NavAccountDropdown";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { useAuth } from "@/providers/authProvider";

export const Navbar = () => {
  const pathname = usePathname();
  const auth = useAuth();
  const navItems = auth.role === "TEACHER" ? siteConfig.navTeacherItems : siteConfig.navUserItems;

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo className="text-primary-500" />
            <p className="font-bold text-inherit text-primary-500">LearnHowToCode</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden sm:flex gap-4 justify-start ml-2">
          {navItems.map((item) => (
            (!item.authRequired || auth.isAuthenticated) && (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    {
                      "text-primary font-medium": pathname.startsWith(item.href),
                      "text-default-500": !pathname.startsWith(item.href),
                    }
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            )
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        <ThemeSwitch />
        {auth.isAuthenticated ?
          <NavbarAccount />
          :
          siteConfig.navMenuAuth.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  {
                    "text-primary font-medium": pathname.startsWith(item.href),
                    "text-default-500": !pathname.startsWith(item.href),
                  }
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))
        }

      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            (item.authRequired && auth.isAuthenticated) && (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color={
                    index === 3
                      ? "primary"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "danger"
                        : "foreground"
                  }
                  href={item.href}
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            )))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
