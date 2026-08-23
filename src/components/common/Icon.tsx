'use client';

import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Icon Component
 * Renders Lucide icons dynamically by name
 * Usage: <Icon name="Yoga" className="h-6 w-6" />
 */
export function Icon({ name, className = 'h-5 w-5', size = 20, strokeWidth = 1.5 }: IconProps) {
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<any>>)[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <IconComponent 
      className={className} 
      size={size} 
      strokeWidth={strokeWidth}
    />
  );
}
