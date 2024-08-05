"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";

const routes = [
  { title: "Features", path: "/features" },
  { title: "Updates", path: "updates" },
  { title: "Pricing", path: "/pricing" },
  { title: "Support", path: "/support" },
];

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Introduction",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "What does it do?",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Working in the team",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
]

const Header = () => {
  const [path, setPath] = useState("#features");

  const {user} = useSupabaseUser()

  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex gap-5 items-center">
        <Link href="/" className="font-bold text-lg">
          {/* <Image/> suppose to be logo */}
          <span>study-me</span>
        </Link>
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="gap-2 lg:gap-6">
            <NavigationMenuItem>
              <NavigationMenuTrigger onClick={() => setPath("#resources")}>
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
            </NavigationMenuItem>
            {routes.map((route) => (
              <NavigationMenuItem key={route.path}>
                <Link href={route.path} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {route.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {user ? <div>
          Profile settings
      </div> : <div className="flex gap-3">
        <Link href="/login" className="py-1 px-4 bg-slate-200 rounded-lg">
          Login
        </Link>
        <Link
          href="/signup"
          className="py-1 px-4 bg-indigo-500 text-white rounded-lg"
        >
          Start for free
        </Link>
      </div>}
    </nav>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Header;
