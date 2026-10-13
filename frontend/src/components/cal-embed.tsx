/**
 * Cal.com Embed Component for QuikSpit Shine
 *
 * This component provides an inline Cal.com booking embed with prefill support.
 * It integrates with the booking wizard to show a service summary and
 * prefill booking notes with customer selections.
 *
 * @module components/cal-embed
 *
 * CONFIGURATION:
 * - The Cal.com username and each category's event slug come from the
 *   published service catalog, edited in the admin under Services & prices
 * - Stripe integration configured in Cal.com dashboard
 *
 * CUSTOMIZATION:
 * - Change the booking deposit from the admin booking settings panel
 * - Modify THEME_CONFIG to adjust embed appearance
 */

'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { hasBookingDeposit } from '@/lib/booking-settings';
import { isConfirmedCalBooking, readCalEmbedEvent } from '@/lib/cal-embed-events';
import { formatCents, formatDuration } from '@/lib/content/catalog';
import { siteCopy } from '@/lib/content/fields';
import { useSiteContent } from '@/components/content/site-content-context';
import type { BookingSelection } from './booking/booking-data';

// ============================================================================
// CONFIGURATION - Modify these values to customize behavior
// ============================================================================

/**
 * Theme configuration for the Cal.com embed
 * Matches QuikSpit Shine's dark theme with red accents
 */
const THEME_CONFIG = {
    theme: 'dark' as const,
    styles: {
        branding: {
            brandColor: '#ef4444', // Red accent matching site
        },
    },
    hideEventTypeDetails: false,
};

// ============================================================================
// TYPES
// ============================================================================

export interface CalEmbedProps {
    /** Priced booking selection from the wizard; it carries the Cal.com link. */
    selection?: BookingSelection | null;
    /** Additional CSS classes */
    className?: string;
    /** Callback fired when the calendar embed is ready */
    onReady?: () => void;
    /** Callback for an accepted booking with no outstanding payment step. */
    onBookingSuccessful?: () => void;
    /** Deposit amount configured by admin */
    depositAmount?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format booking selection into a notes string for Cal.com
 * This appears in the booking notes field
 */
export function formatBookingNotes(selection: BookingSelection, depositAmount = 0): string {
    const lines: string[] = [
        '📋 SERVICE SUMMARY',
        '━━━━━━━━━━━━━━━━━━━',
        `Package: ${selection.packageName}`,
        `Vehicle: ${selection.sizeLabel}`,
    ];

    if (selection.addonNames.length > 0) {
        lines.push(`Add-ons: ${selection.addonNames.join(', ')}`);
    }
    if (selection.coatingName) {
        lines.push(`Ceramic: ${selection.coatingName}`);
    }
    if (selection.correctionName) {
        lines.push(`Paint Correction: ${selection.correctionName}`);
    }
    lines.push(`Takes about: ${formatDuration(selection.duration)}`);

    // Pricing
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━');
    lines.push(`💰 ESTIMATED TOTAL: ${formatCents(selection.totalCents)}`);

    if (hasBookingDeposit(depositAmount)) {
        const depositCents = Math.round(depositAmount * 100);
        const balance = Math.max(selection.totalCents - depositCents, 0);
        lines.push(`💳 Deposit (today): ${formatCents(depositCents)}`);
        lines.push(`📅 Balance (at service): ${formatCents(balance)}`);
    }

    return lines.join('\n');
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Cal.com inline booking embed with prefill support
 * 
 * @example
 * // Basic usage (direct booking)
 * <CalEmbed />
 * 
 * @example
 * // With pricing calculator selection
 * <CalEmbed selection={bookingSelection} />
 */
export function CalEmbed({
    selection,
    className = '',
    onReady,
    onBookingSuccessful,
    depositAmount = 0,
}: CalEmbedProps) {
    const [readyEmbedKey, setReadyEmbedKey] = useState<string | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const site = useSiteContent();
    const calLink = selection?.calLink ?? '';

    // Build config for Cal.com embed with proper typing
    const calConfig = useMemo((): Record<string, string> => {
        const config: Record<string, string> = {
            theme: 'dark',
        };

        if (selection) {
            config.notes = formatBookingNotes(selection, depositAmount);
        }

        return config;
    }, [selection, depositAmount]);

    const selectionSignature = useMemo(() => {
        if (!selection) return 'default';

        return [
            selection.categoryId,
            selection.packageId,
            selection.vehicleSizeId,
            selection.addonIds.join(','),
            selection.coatingId || '',
            selection.correctionId || '',
            selection.totalCents.toString(),
            depositAmount.toString(),
        ]
            .map((part) => encodeURIComponent(part))
            .join('__');
    }, [selection, depositAmount]);

    // Remount the Cal iframe whenever the booking details change.
    const embedKey = useMemo(
        () => `cal-embed-${calLink}-${selectionSignature}`,
        [calLink, selectionSignature]
    );

    const bookingUrl = useMemo(() => {
        const url = new URL(`https://cal.com/${calLink}`);
        if (calConfig.notes) url.searchParams.set('notes', calConfig.notes);
        return url.toString();
    }, [calLink, calConfig]);

    // Initialize Cal.com API BEFORE rendering the Cal component
    // This fixes the "iframe doesn't exist" race condition
    useEffect(() => {
        let isMounted = true;
        setReadyEmbedKey(null);
        setLoadFailed(false);
        const loadingTimeout = window.setTimeout(() => setLoadFailed(true), 12_000);

        const handleMessage = (event: MessageEvent<unknown>) => {
            const iframe = containerRef.current?.querySelector('iframe') ?? null;
            const message = readCalEmbedEvent(event, iframe, embedKey);
            if (!message) return;

            if (message.type === 'linkReady') {
                window.clearTimeout(loadingTimeout);
                setLoadFailed(false);
                onReady?.();
            } else if (isConfirmedCalBooking(message.data)) {
                onBookingSuccessful?.();
            }
        };
        window.addEventListener('message', handleMessage);

        (async function initCal() {
            try {
                // Use a namespace to isolate this embed instance
                const cal = await getCalApi({ namespace: embedKey });
                if (!isMounted) return;
                cal('ui', THEME_CONFIG);
                setReadyEmbedKey(embedKey);
            } catch (error) {
                console.warn('[CalEmbed] Init warning:', error);
                if (isMounted) setLoadFailed(true);
            }
        })();

        return () => {
            isMounted = false;
            window.clearTimeout(loadingTimeout);
            window.removeEventListener('message', handleMessage);
        };
    }, [embedKey, onReady, onBookingSuccessful]);

    return (
        <div ref={containerRef} className={`cal-embed-container ${className}`}>
            {/* Only render Cal component after API is initialized */}
            {readyEmbedKey === embedKey ? (
                <Cal
                    key={embedKey}
                    namespace={embedKey}
                    calLink={calLink}
                    style={{ width: '100%', height: '100%', minHeight: '600px' }}
                    config={calConfig}
                />
            ) : (
                <div
                    className="flex items-center justify-center rounded-lg"
                    style={{ width: '100%', minHeight: '600px' }}
                >
                    <div className="text-neutral-400" role="status">
                        {loadFailed
                            ? siteCopy(site, 'scheduling.failed', 'The booking calendar could not load.')
                            : siteCopy(site, 'scheduling.loading', 'Loading the calendar…')}
                    </div>
                </div>
            )}
            <p className="mt-4 text-sm text-neutral-400" role={loadFailed ? 'status' : undefined}>
                {loadFailed ? 'Having trouble loading the calendar? ' : 'Prefer a separate window? '}
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 underline underline-offset-4">
                    {siteCopy(site, 'scheduling.openLabel', 'Open scheduling on Cal.com')}
                </a>
            </p>
        </div>
    );
}
