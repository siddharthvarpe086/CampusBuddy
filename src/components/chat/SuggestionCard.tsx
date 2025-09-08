import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface SuggestionCardProps {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const SuggestionCard = ({ title, icon: Icon, onClick }: SuggestionCardProps) => {
  return (
    <Card 
      className="p-4 cursor-pointer card-hover bg-card border border-border shadow-card group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
        <p className="text-sm font-medium text-card-foreground font-poppins group-hover:text-primary transition-colors duration-300">{title}</p>
      </div>
    </Card>
  );
};