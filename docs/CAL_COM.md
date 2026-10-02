# Cal.com Booking Integration

QuikSpit uses [Cal.com](https://cal.com) for appointment scheduling with Stripe payment integration.

## Setup

### 1. Cal.com Account Setup

1. Create account at [cal.com](https://cal.com)
2. Go to **Event Types** and create these events:

| Slug | Name | Deposit | Description |
|------|------|---------|-------------|
| `full-detail` | Full Detail | $50 | Interior + Exterior combos |
| `interior` | Interior Detail | $40 | Interior-only packages |
| `exterior` | Exterior Detail | $30 | Exterior-only packages |

3. For each event:
   - Set appropriate duration (2-4 hours)
   - Configure availability schedule
   - Enable Stripe payment (Apps → Stripe → set deposit price)

### 2. Environment Variables

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_CAL_USERNAME=quikspitboise
```

### Garage address delivery

The public site promises that customers receive the private garage address in
their confirmation email. The frontend does not store or send that address;
address delivery must be configured in Cal.com for `full-detail`, `interior`,
and `exterior`.

Configure the address in the attendee confirmation notification, and keep it
out of public event descriptions and any location displayed before booking.
See [Cal.com's event settings](https://cal.com/blog/a-guide-to-cal-com-s-event-settings-and-features).
For each event type, verify that a confirmed test booking receives the address
and that an unbooked visitor cannot see it. Repeat this check when changing
event locations or notification workflows.

### 3. Stripe Integration

1. In Cal.com: Apps → Install Stripe → Connect your Stripe account
2. Per event type: Edit event → Apps → Stripe → Enable and set price

## Architecture

```
Pricing Calculator → Book Now → Booking Page → Cal.com Embed
       ↓                           ↓
   URL params              Prefilled notes + 
   (selections)            Service Summary
```

**Flow:**
1. User configures services in pricing calculator
2. "Book Now" navigates to `/booking?category=...&tier=...&total=...`
3. Booking page displays service summary with deposit/balance breakdown
4. Cal.com embed prefills notes with full service details
5. Customer pays deposit via Stripe, you collect balance at service

## Key Files

| File | Purpose |
|------|---------|
| `src/components/cal-embed.tsx` | CalEmbed component + utilities |
| `src/components/pricing-calculator.tsx` | Calculator with booking navigation |
| `src/app/booking/page.tsx` | Booking page with embed |

## Customization

### Deposit Amounts

Edit `DEPOSIT_AMOUNTS` in `src/components/cal-embed.tsx`:

```typescript
export const DEPOSIT_AMOUNTS = {
    combo: 50,     // Full Detail deposit
    interior: 40,  // Interior-only deposit
    exterior: 30,  // Exterior-only deposit
    default: 50,
} as const;
```

### Event Slugs

Edit `EVENT_SLUGS` in `src/components/cal-embed.tsx`:

```typescript
export const EVENT_SLUGS = {
    combo: 'full-detail',
    interior: 'interior', 
    exterior: 'exterior',
    default: 'full-detail',
} as const;
```

### Theme

Edit `THEME_CONFIG` in `src/components/cal-embed.tsx` to adjust embed appearance.

## Resources

- [Cal.com Documentation](https://cal.com/docs)
- [Cal.com Stripe Integration](https://cal.com/docs/how-to-guides/how-to-accept-payments)
- [Embed React Package](https://www.npmjs.com/package/@calcom/embed-react)
