"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    )
  }

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon
        const isOpen = openItems.includes(item.title)

        if (item.items) {
          return (
            <Collapsible key={item.title} open={isOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  onClick={() => toggleItem(item.title)}
                  active={item.isActive}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {item.title}
                  <ChevronRight
                    className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <Link key={subItem.url} href={subItem.url}>
                      <SidebarMenuSubItem>{subItem.title}</SidebarMenuSubItem>
                    </Link>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        }

        return (
          <Link key={item.url} href={item.url}>
            <SidebarMenuItem active={item.isActive}>
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {item.title}
            </SidebarMenuItem>
          </Link>
        )
      })}
    </SidebarMenu>
  )
}