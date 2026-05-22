import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AQI_CATEGORIES } from '@/utils/aqi-utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all',
  {
    variants: {
      variant: {
        default:     'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        good:        'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30',
        moderate:    'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/30',
        sensitive:   'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-500/30',
        unhealthy:   'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30',
        veryBad:     'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-500/30',
        hazardous:   'bg-rose-200 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900/40',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const AQI_BADGE_MAP: Record<number, { label: string; variant: BadgeVariant }> = {
  1: { label: 'Good',             variant: 'good'      },
  2: { label: 'Moderate',         variant: 'moderate'  },
  3: { label: 'Unhealthy SG',     variant: 'sensitive' },
  4: { label: 'Unhealthy',        variant: 'unhealthy' },
  5: { label: 'Very Unhealthy',   variant: 'veryBad'   },
  6: { label: 'Hazardous',        variant: 'hazardous' },
};

export function AqiBadge({ index }: { index: number }) {
  const info = AQI_BADGE_MAP[index] ?? AQI_BADGE_MAP[1];
  return (
    <Badge variant={info.variant}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
      {info.label}
    </Badge>
  );
}
