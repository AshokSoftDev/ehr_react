import React from 'react';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/themeHook';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ToolbarProps {
  isMobile: boolean;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
  onToggleAIChat: () => void;
  isAIChatOpen: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isMobile,
  isSidebarExpanded,
  toggleSidebar,
  handleLogout,
  onToggleAIChat,
  isAIChatOpen,
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

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => toggleTheme()} className="text-foreground">
          {theme === 'light' ? <Sun /> : <Moon />}
        </Button>

        {/* AI Chat Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAIChat}
          className="relative text-foreground hover:text-purple-600 dark:hover:text-purple-400"
          title="AI Assistant"
        >
          <Sparkles className={`w-5 h-5 transition-colors ${isAIChatOpen ? 'text-purple-500' : ''}`} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="@shadcn" />
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
