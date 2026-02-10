import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: 'primary' | 'secondary' | 'accent' | 'info';
}

const colorMap = {
  primary: 'bg-primary/15 text-primary-foreground',
  secondary: 'bg-secondary/15 text-secondary',
  accent: 'bg-accent text-accent-foreground',
  info: 'bg-info/15 text-info',
};

const iconColorMap = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent text-accent-foreground',
  info: 'bg-info text-info-foreground',
};

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className="shadow-card border-0">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
