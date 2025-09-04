import { ArrowLeft, Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
}

export const NavigationBar = ({ 
  title = "Campus Chat Bot", 
  showBack = false, 
  onBack,
  showMenu = false,
  onMenu
}: NavigationBarProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-16 bg-card border-b border-border shadow-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="transition-smooth hover:bg-campus-blue-light"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenu}
            className="transition-smooth hover:bg-campus-blue-light"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        <h1 className="text-lg font-semibold text-foreground font-poppins">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {user && profile && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{profile.full_name}</span>
              {profile.user_type === 'faculty' && (
                <span className="text-xs text-primary ml-1">(Faculty)</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="transition-smooth hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="transition-smooth hover:bg-primary/10"
          >
            <User className="h-4 w-4" />
            <span className="ml-1">Login</span>
          </Button>
        )}
      </div>
    </header>
  );
};