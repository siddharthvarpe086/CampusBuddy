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
      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-elevated hover:-translate-y-1 bg-card border border-border shadow-card"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-card-foreground font-poppins">{title}</p>
      </div>
    </Card>
  );
};