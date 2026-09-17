import type { StatItem } from '@/lib/types';

/* These describe the shape of the offer, not client outcomes — every value here
   is verifiable against the data files that drive the page. Swap in real
   outcome metrics (clients served, campaigns shipped, measured lift) as soon as
   they exist; those earn far more trust in this slot than capability counts. */
export const stats: StatItem[] = [
    { value: '8', label: 'Core Service Lines' },
    { value: '4', label: 'Capability Pillars' },
    { value: '5', label: 'Stage Delivery Process' },
    { value: '24/7', label: 'Support Coverage' },
];
