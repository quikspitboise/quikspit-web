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
 * - Modify DEPOSIT_AMOUNTS to change per-category deposits
 * - Modify EVENT_SLUGS to change Cal.com event routing
 * - Modify THEME_CONFIG to adjust embed appearance
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';

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
 * Deposit amounts per category (in USD)
 * These should match the Stripe prices configured in Cal.com
 */
export const DEPOSIT_AMOUNTS = {
    combo: 50,
    interior: 40,
    exterior: 30,
    default: 50,
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
 * Get the deposit amount for a category
 */
export function getDepositAmount(category: string): number {
    return DEPOSIT_AMOUNTS[category as keyof typeof DEPOSIT_AMOUNTS] || DEPOSIT_AMOUNTS.default;
}

/**
 * Format booking selection into a notes string for Cal.com
 * This appears in the booking notes field
 */
export function formatBookingNotes(selection: BookingSelection): string {
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

    const deposit = getDepositAmount(selection.category);
    const balance = selection.total - deposit;
    lines.push(`💳 Deposit (today): $${deposit}`);
    lines.push(`📅 Balance (at service): $${balance}`);

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
    addons: string[];
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
    if (selection.addons.length > 0) params.set('addons', selection.addons.join(','));
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
export function CalEmbed({ selection, eventSlug, className = '' }: CalEmbedProps) {
    const [isReady, setIsReady] = useState(false);

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
            config.notes = formatBookingNotes(selection);
        }

        return config;
    }, [selection]);

    // Generate a stable key to prevent iframe recreation on every render
    // but allow recreation when calLink changes
    const embedKey = useMemo(() => `cal-embed-${calLink}`, [calLink]);

    // Initialize Cal.com API BEFORE rendering the Cal component
    // This fixes the "iframe doesn't exist" race condition
    useEffect(() => {
        let isMounted = true;

        (async function initCal() {
            try {
                // Use a namespace to isolate this embed instance
                const cal = await getCalApi({ namespace: embedKey });
                cal('ui', THEME_CONFIG);

                // Only update state if component is still mounted
                if (isMounted) {
                    setIsReady(true);
                }
            } catch (error) {
                // Cal.com embed errors are non-fatal, log and continue
                console.warn('[CalEmbed] Init warning:', error);
                if (isMounted) {
                    setIsReady(true); // Still show embed, it may work
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [embedKey]);

    return (
        <div className={`cal-embed-container ${className}`}>
            {/* Only render Cal component after API is initialized */}
            {isReady ? (
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
                    <div className="animate-pulse text-neutral-400">Loading booking calendar...</div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// SERVICE SUMMARY COMPONENT
// ============================================================================

interface ServiceSummaryProps {
    selection: BookingSelection;
    className?: string;
}

/**
 * Displays a summary of selected services with pricing breakdown
 * Shows deposit amount and balance due at service
 */
export function ServiceSummary({ selection, className = '' }: ServiceSummaryProps) {
    const deposit = getDepositAmount(selection.category);
    const balance = selection.total - deposit;
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

                <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Deposit (due today)</span>
                    <span className="text-red-500 font-semibold">${deposit}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Balance (at service)</span>
                    <span className="text-neutral-300">${balance}</span>
                </div>
            </div>

            <p className="text-neutral-500 text-xs mt-4">
                * Final price may vary based on vehicle condition.
            </p>
        </div>
    );
}

export default CalEmbed;
