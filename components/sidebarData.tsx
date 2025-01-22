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

export const data = {
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
        { title: "Commandes", url: "/orders", icon: ShoppingCart },
        { title: "Catégories", url: "/categories", icon: FolderTree },
      ],
    },
    {
      title: "Gestion",
      items: [
        { title: "Clients", url: "/customers", icon: Users },
        { title: "Produits", url: "/products", icon: Package },
        { title: "Campagnes", url: "/campaigns", icon: Megaphone },
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
