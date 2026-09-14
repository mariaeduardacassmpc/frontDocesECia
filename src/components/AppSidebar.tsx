import { LayoutDashboard, Package, ShoppingCart, DollarSign, Users, LogOut, UserRoundPen, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useSession } from "@/contexts/SessionContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const items = [
  { title: "Painel", url: "/", icon: LayoutDashboard },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
];

export function AppSidebar() {
  const { exit } = useSession();

  return (
    <Sidebar className="border-r border-border">
    <div className="p-4 pb-3 border-b border-border">
    <div className="flex flex-col gap-2">
      <img 
        src="/logo.png" 
        alt="Logo Doceria" 
        className="h-24 w-24 object-cover rounded-full"
      />
      <h1 className="text-sm text-muted-foreground">
        Marcelo Doces & Cia
      </h1>
    </div>
  </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                      activeClassName="bg-primary/15 text-primary-foreground font-bold"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/perfil"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeClassName="bg-primary/15 text-primary-foreground font-bold"
              >
                <UserRoundPen className="h-5 w-5" />
                <span className="flex-1">Editar dados</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={exit}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
