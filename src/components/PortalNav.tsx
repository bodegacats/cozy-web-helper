import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Home, FileText, MessageSquare, LogOut } from "lucide-react";

interface PortalNavProps {
  currentPage: 'home' | 'request' | 'chat';
  client: {
    name: string;
    business_name: string | null;
  };
}

export const PortalNav = ({ currentPage, client }: PortalNavProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/portal');
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/portal/home' },
    { id: 'request', label: 'Submit Request', icon: FileText, path: '/portal/request' },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare, path: '/portal/chat' },
  ];

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="font-semibold text-lg">
                {client.business_name || client.name}
              </h2>
              {client.business_name && (
                <p className="text-sm text-muted-foreground">{client.name}</p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => navigate(item.path)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => navigate(item.path)}
                size="sm"
                className="flex-1 gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
