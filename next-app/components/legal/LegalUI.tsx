import { isPlaceholder } from '@/lib/company';
import styles from '@/app/legal.module.css';

/* Renders a company detail, or a visible blank if it hasn't been supplied yet.
   Deliberately conspicuous: a policy quoting "TODO:" at the public is worse
   than one that plainly shows the gap. */
export function Val({ value, label }: { value: string; label?: string }) {
    if (isPlaceholder(value)) {
        return (
            <span
                className={styles.pending}
                title={label ? `Pending: ${label}` : 'Pending'}
                aria-label={label ? `${label}: to be confirmed` : 'To be confirmed'}
            >
                to be confirmed
            </span>
        );
    }
    return <>{value}</>;
}

/* Shown while the policies are unreviewed drafts. Delete both usages once
   counsel has signed off — see the note in each legal page. */
export function ReviewNotice() {
    return (
        <p className={styles.notice}>
            <span aria-hidden="true">⚠</span>
            <span>
                <strong>Draft: pending legal review.</strong> This document describes our
                intended practices accurately, but it has not yet been reviewed by counsel and
                some company details are still to be confirmed. It should not be relied upon as
                a final statement of our obligations.
            </span>
        </p>
    );
}
