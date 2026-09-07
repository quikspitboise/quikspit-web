/**
 * Cal.com Embed Component for QuikSpit Shine
 * 
 * This component provides an inline Cal.com booking embed with prefill support.
 * It integrates with the pricing calculator to show a service summary and
 * prefill booking notes with customer selections.
 * 
 * @module components/cal-embed
 * 
 * CONFIGURATION:
 * - Set NEXT_PUBLIC_CAL_USERNAME in .env.local (default: quikspitboise)
 * - Cal.com event slugs should match: full-detail, interior, exterior
 * - Stripe integration configured in Cal.com dashboard
 * 
 * CUSTOMIZATION:
 * - Change the booking deposit from the admin booking settings panel
 * - Modify EVENT_SLUGS to change Cal.com event routing
 * - Modify THEME_CONFIG to adjust embed appearance
 */

'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { hasBookingDeposit } from '@/lib/booking-settings';
import { isConfirmedCalBooking, readCalEmbedEvent } from '@/lib/cal-embed-events';

// ============================================================================
// CONFIGURATION - Modify these values to customize behavior
// ============================================================================

/**
 * Cal.com username - should match your Cal.com account
 * Configured via NEXT_PUBLIC_CAL_USERNAME environment variable
 */
const CAL_USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME || 'quikspitboise';

/**
 * Event slugs for each service category
 * These must match the event types created in Cal.com dashboard
 */
export const EVENT_SLUGS = {
    combo: 'full-detail',
    interior: 'interior',
    exterior: 'exterior',
    default: 'full-detail',
} as const;

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

export interface BookingSelection {
    /** Package category: combo, interior, or exterior */
    category: string;
    /** Package tier: silver, gold, or platinum */
    tier: string;
    /** Vehicle size id */
    size: string;
    /** Size label for display */
    sizeLabel?: string;
    /** Comma-separated addon names */
    addons: string;
    /** Ceramic coating selected */
    ceramic?: string;
    /** Paint correction level */
    paintCorrection?: string;
    /** Calculated total price */
    total: number;
    /** Package display name */
    packageName?: string;
}

export interface CalEmbedProps {
    /** Booking selection data from pricing calculator */
    selection?: BookingSelection | null;
    /** Override the event slug (defaults to category-based routing) */
    eventSlug?: string;
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
 * Get the Cal.com event slug for a category
 */
export function getEventSlug(category: string): string {
    return EVENT_SLUGS[category as keyof typeof EVENT_SLUGS] || EVENT_SLUGS.default;
}

/**
 * Format booking selection into a notes string for Cal.com
 * This appears in the booking notes field
 */
export function formatBookingNotes(selection: BookingSelection, depositAmount = 0): string {
    const lines: string[] = [
        '📋 SERVICE SUMMARY',
        '━━━━━━━━━━━━━━━━━━━',
    ];

    // Package info
    if (selection.packageName) {
        lines.push(`Package: ${selection.packageName}`);
    } else if (selection.tier && selection.category) {
        const tierLabel = selection.tier.charAt(0).toUpperCase() + selection.tier.slice(1);
        const categoryLabel = selection.category === 'combo' ? 'Full Detail' :
            selection.category.charAt(0).toUpperCase() + selection.category.slice(1);
        lines.push(`Package: ${tierLabel} (${categoryLabel})`);
    }

    // Vehicle size
    if (selection.sizeLabel) {
        lines.push(`Vehicle: ${selection.sizeLabel}`);
    } else if (selection.size) {
        lines.push(`Vehicle Size: ${selection.size}`);
    }

    // Add-ons
    if (selection.addons) {
        const addonList = selection.addons.split(',').map(a => a.trim()).filter(Boolean);
        if (addonList.length > 0) {
            lines.push(`Add-ons: ${addonList.join(', ')}`);
        }
    }

    // Ceramic services
    if (selection.ceramic) {
        lines.push(`Ceramic: ${selection.ceramic}`);
    }
    if (selection.paintCorrection) {
        lines.push(`Paint Correction: ${selection.paintCorrection}`);
    }

    // Pricing
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━');
    lines.push(`💰 ESTIMATED TOTAL: $${selection.total}`);

    if (hasBookingDeposit(depositAmount)) {
        const balance = Math.max(selection.total - depositAmount, 0);
        lines.push(`💳 Deposit (today): $${depositAmount}`);
        lines.push(`📅 Balance (at service): $${balance}`);
    }

    return lines.join('\n');
}

/**
 * Build URL search params for booking page navigation
 */
export function buildBookingParams(selection: {
    category: string;
    tier: string;
    size: string;
    sizeLabel?: string;
    addons: string;
    ceramic?: string;
    paintCorrection?: string;
    total: number;
    packageName?: string;
}): URLSearchParams {
    const params = new URLSearchParams();

    params.set('category', selection.category);
    params.set('tier', selection.tier);
    params.set('size', selection.size);
    if (selection.sizeLabel) params.set('sizeLabel', selection.sizeLabel);
    if (selection.addons) params.set('addons', selection.addons);
    if (selection.ceramic) params.set('ceramic', selection.ceramic);
    if (selection.paintCorrection) params.set('paintCorrection', selection.paintCorrection);
    params.set('total', selection.total.toString());
    if (selection.packageName) params.set('packageName', selection.packageName);

    return params;
}

/**
 * Parse booking selection from URL search params
 */
export function parseBookingParams(searchParams: URLSearchParams): BookingSelection | null {
    const category = searchParams.get('category');
    const tier = searchParams.get('tier');
    const total = searchParams.get('total');

    if (!category || !tier || !total) {
        return null;
    }

    return {
        category,
        tier,
        size: searchParams.get('size') || 'car',
        sizeLabel: searchParams.get('sizeLabel') || undefined,
        addons: searchParams.get('addons') || '',
        ceramic: searchParams.get('ceramic') || undefined,
        paintCorrection: searchParams.get('paintCorrection') || undefined,
        total: parseInt(total, 10) || 0,
        packageName: searchParams.get('packageName') || undefined,
    };
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
    eventSlug,
    className = '',
    onReady,
    onBookingSuccessful,
    depositAmount = 0,
}: CalEmbedProps) {
    const [readyEmbedKey, setReadyEmbedKey] = useState<string | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Determine which Cal.com event to show
    const calLink = useMemo(() => {
        const slug = eventSlug || (selection?.category ? getEventSlug(selection.category) : EVENT_SLUGS.default);
        return `${CAL_USERNAME}/${slug}`;
    }, [eventSlug, selection?.category]);

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
            selection.category,
            selection.tier,
            selection.size,
            selection.sizeLabel || '',
            selection.addons,
            selection.ceramic || '',
            selection.paintCorrection || '',
            selection.total.toString(),
            selection.packageName || '',
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
                    className="flex items-center justify-center bg-neutral-900/50 rounded-lg"
                    style={{ width: '100%', minHeight: '600px' }}
                >
                    <div className="text-neutral-400" role="status">
                        {loadFailed ? 'The booking calendar could not load.' : 'Loading booking calendar...'}
                    </div>
                </div>
            )}
            <p className="mt-4 text-sm text-neutral-400" role={loadFailed ? 'status' : undefined}>
                {loadFailed ? 'Having trouble loading the calendar? ' : 'Prefer a separate window? '}
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 underline underline-offset-4">
                    Open scheduling on Cal.com
                </a>
            </p>
        </div>
    );
}

// ============================================================================
// SERVICE SUMMARY COMPONENT
// ============================================================================

interface ServiceSummaryProps {
    selection: BookingSelection;
    className?: string;
    depositAmount?: number;
}

/**
 * Displays a summary of selected services with pricing breakdown
 * Shows deposit amount and balance due at service
 */
export function ServiceSummary({
    selection,
    className = '',
    depositAmount = 0,
}: ServiceSummaryProps) {
    const showDeposit = hasBookingDeposit(depositAmount);
    const balance = Math.max(selection.total - depositAmount, 0);
    const addonList = selection.addons?.split(',').map(a => a.trim()).filter(Boolean) || [];

    return (
        <div className={`bg-neutral-800/50 rounded-xl border border-neutral-700 p-6 ${className}`}>
            <h3 className="font-display text-xl text-white tracking-wide mb-4">YOUR SELECTION</h3>

            <div className="space-y-3 text-sm">
                {/* Package */}
                <div className="flex justify-between">
                    <span className="text-neutral-400">Package</span>
                    <span className="text-white font-medium">
                        {selection.packageName || `${selection.tier} (${selection.category})`}
                    </span>
                </div>

                {/* Vehicle */}
                {selection.sizeLabel && (
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Vehicle</span>
                        <span className="text-white">{selection.sizeLabel}</span>
                    </div>
                )}

                {/* Add-ons */}
                {addonList.length > 0 && (
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Add-ons</span>
                        <span className="text-white text-right max-w-[60%]">{addonList.join(', ')}</span>
                    </div>
                )}

                {/* Ceramic */}
                {selection.ceramic && (
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Ceramic Coating</span>
                        <span className="text-white">Yes</span>
                    </div>
                )}

                {/* Paint Correction */}
                {selection.paintCorrection && (
                    <div className="flex justify-between">
                        <span className="text-neutral-400">Paint Correction</span>
                        <span className="text-white">{selection.paintCorrection}</span>
                    </div>
                )}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-neutral-700 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-lg">
                    <span className="text-neutral-300">Estimated Total</span>
                    <span className="text-white font-display text-2xl">${selection.total}</span>
                </div>

                {showDeposit && (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Deposit (due today)</span>
                            <span className="text-red-500 font-semibold">${depositAmount}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Balance (at service)</span>
                            <span className="text-neutral-300">${balance}</span>
                        </div>
                    </>
                )}
            </div>

            <p className="text-neutral-500 text-xs mt-4">
                * Final price may vary based on vehicle condition.
            </p>
        </div>
    );
}

export default CalEmbed;
