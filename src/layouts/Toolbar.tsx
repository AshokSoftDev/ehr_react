import React from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/themeHook';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ToolbarProps {
  isMobile: boolean;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isMobile,
  isSidebarExpanded,
  toggleSidebar,
  handleLogout
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-14 w-full flex items-center justify-between px-4 bg-card text-foreground">
      <div className="flex items-center">
        {(isMobile || !isSidebarExpanded) && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-foreground">
            {isSidebarExpanded && isMobile ? <X /> : <Menu />}
          </Button>
        )}
        <h1 className="text-lg font-semibold ml-2">EHR System</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => toggleTheme()} className="text-foreground">
          {theme === 'light' ? <Sun /> : <Moon />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
