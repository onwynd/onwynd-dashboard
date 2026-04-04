"use client";

import { FileText, Users, TrendingUp, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "file" | "users" | "chart" | "package" | "alert";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon = "file", 
  action, 
  className = ""
}: EmptyStateProps) {
  const getIcon = () => {
    const iconProps = {
      className: "w-12 h-12 text-muted-foreground mb-4"
    };

    switch (icon) {
      case "users":
        return <Users {...iconProps} />;
      case "chart":
        return <TrendingUp {...iconProps} />;
      case "package":
        return <Package {...iconProps} />;
      case "alert":
        return <AlertCircle {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex flex-col items-center justify-center">
        {getIcon()}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
        {action && (
          <Button 
            onClick={action.onClick}
            variant="outline"
            size="sm"
          >
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}

interface EmptyTableStateProps {
  title?: string;
  description?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyTableState({ 
  title = "No data found",
  description = "There are no items to display at the moment.",
  hasFilters = false,
  onClearFilters
}: EmptyTableStateProps) {
  if (hasFilters && onClearFilters) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        <Button 
          onClick={onClearFilters}
          variant="outline"
          size="sm"
        >
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

interface EmptyChartStateProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
}

export function EmptyChartState({ 
  title = "No data available",
  description = "There is no data to display for this chart.",
  onRefresh
}: EmptyChartStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center">
      <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      {onRefresh && (
        <Button 
          onClick={onRefresh}
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}