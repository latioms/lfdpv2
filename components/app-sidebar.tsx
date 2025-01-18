"use client";

import * as React from "react";
import {
  Home,
  ShoppingCart,
  FolderTree,
  Users,
  Package,
  Megaphone,
  BarChart2,
  ClipboardList,
  FileText,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "admin@lfp.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Tableau de bord",
      items: [
        { title: "Accueil", url: "/home", icon: Home },
        { title: "Commandes", url: "/commandes", icon: ShoppingCart },
        { title: "Catégories", url: "/categories", icon: FolderTree },
      ],
    },
    {
      title: "Gestion",
      items: [
        { title: "Clients", url: "/clients", icon: Users },
        { title: "Produits", url: "/produits", icon: Package },
        { title: "Campagnes", url: "/campagnes", icon: Megaphone },
      ],
    },
    {
      title: "Analyses",
      items: [
        { title: "Statistiques", url: "/dashboard/stats", icon: BarChart2 },
        { title: "Journal", url: "/dashboard/journal", icon: ClipboardList },
        { title: "Rapport", url: "/dashboard/rapport", icon: FileText },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher companyName="LFDP" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
        user={data.user}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
