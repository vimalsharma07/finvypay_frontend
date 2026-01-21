import { ReactNode } from 'react';
import Link from 'next/link';
import { Moon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { performLogout } from '@/lib/utils/logout';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-1">
            <div className="w-9 h-9 rounded-full border border-border bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold uppercase">
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex flex-col">
              <Link
                href="/profile"
                className="text-sm text-mono hover:text-primary font-semibold"
              >
                {user?.name || ''}
              </Link>
              <Link
                href={user?.email ? `mailto:${user.email}` : '#'}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {user?.email || ''}
              </Link>
            </div>
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            Pro
          </Badge>
        </div>

        <DropdownMenuSeparator />

        {/* Simplified Menu */}
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center gap-1"
          >
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-1"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-1 justify-between grow">
            Dark Mode
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => performLogout()}
          >
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
