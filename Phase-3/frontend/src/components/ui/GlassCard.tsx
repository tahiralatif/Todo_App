import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  'relative rounded-xl border backdrop-blur-md transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white/10 border-white/20 shadow-lg',
        elevated: 'bg-white/15 border-white/25 shadow-xl',
        subtle: 'bg-white/5 border-white/10 shadow-md',
        deep: 'bg-white/5 border-white/10 shadow-2xl shadow-blue-500/10',
        floating: 'bg-white/10 border-white/15 shadow-xl hover:shadow-2xl transition-transform',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
GlassCard.displayName = 'GlassCard';

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
const GlassCardHeader = ({
  className,
  ...props
}: GlassCardHeaderProps) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);

interface GlassCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
const GlassCardTitle = ({ className, ...props }: GlassCardTitleProps) => (
  <h3
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);

interface GlassCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
const GlassCardDescription = ({
  className,
  ...props
}: GlassCardDescriptionProps) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
const GlassCardContent = ({ className, ...props }: GlassCardContentProps) => (
  <div className={cn('pt-4', className)} {...props} />
);

interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
const GlassCardFooter = ({ className, ...props }: GlassCardFooterProps) => (
  <div
    className={cn('flex items-center pt-4 border-t border-white/10', className)}
    {...props}
  />
);

export {
  GlassCard,
  GlassCardHeader,
  GlassCardFooter,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  glassCardVariants,
};