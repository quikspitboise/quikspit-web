# Stripe Invoice Integration

QuikSpit uses Stripe invoicing to bill customers for the remaining balance after their deposit.

## Overview

The invoice system follows a **draft-then-send** workflow:
1. **Draft invoice** created automatically after booking confirmation
2. **Invoice sent** manually after service is completed

## Setup

### 1. Stripe Configuration

Ensure these environment variables are set in `backend/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Twilio Configuration (Optional - for SMS)

For SMS invoice delivery, configure Twilio:

```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Webhook Configuration

Add these events in Stripe Dashboard → Webhooks:
- `invoice.paid`
- `invoice.payment_failed`

Webhook URL: `https://yourdomain.com/api/webhooks/stripe`

## API Endpoints

### Create Invoice

```bash
POST /api/invoices
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+12085551234",
  "lineItems": [
    {"description": "Gold Package (Interior + Exterior)", "amount": 240},
    {"description": "Midsize SUV Adjustment", "amount": 25},
    {"description": "Pet Hair Removal", "amount": 35}
  ],
  "depositAmount": 50,
  "createAsDraft": true,
  "sendViaEmail": true,
  "sendViaSms": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft invoice created successfully",
  "data": {
    "invoiceId": "in_xxx",
    "invoiceNumber": "XXXX-0001",
    "status": "draft",
    "hostedInvoiceUrl": "https://invoice.stripe.com/...",
    "total": 250,
    "customerId": "cus_xxx",
    "emailSent": false,
    "smsSent": false
  }
}
```

### Send Draft Invoice

```bash
POST /api/invoices/:id/send
Content-Type: application/json

{
  "sendViaEmail": true,
  "sendViaSms": true,
  "customerPhone": "+12085551234"
}
```

### Get Invoice Details

```bash
GET /api/invoices/:id
```

## Configuration

The invoice service has configurable defaults that can be changed at runtime:

| Setting | Default | Description |
|---------|---------|-------------|
| `defaultDepositAmount` | 50 | Deposit to deduct from invoice |
| `defaultDaysUntilDue` | 7 | Payment due date |
| `autoSendOnCreate` | false | Send immediately vs create draft |
| `defaultSendViaEmail` | true | Send via Stripe email |
| `defaultSendViaSms` | false | Send via Twilio SMS |

## Key Files

| File | Purpose |
|------|---------|
| `src/invoice/invoice.service.ts` | Core invoice logic |
| `src/invoice/invoice.controller.ts` | REST endpoints |
| `src/invoice/dto/create-invoice.dto.ts` | Request validation |
| `src/common/sms.service.ts` | Twilio SMS service |

## Line Item Structure

Each booking is broken into line items:

1. **Base Package** - e.g., "Gold Package (Interior + Exterior)" - $240
2. **Size Adjustment** - e.g., "Midsize SUV Adjustment" - $25
3. **Add-ons** - Each as separate item - $35 each
4. **Ceramic/Paint Correction** - As applicable
5. **Deposit Credit** - Negative line item - -$50

## Integration with Cal.com Bookings

When a booking is confirmed via Cal.com:
1. Extract service selections from booking notes
2. Call `POST /api/invoices` with `createAsDraft: true`
3. After service completion, call `POST /api/invoices/:id/send`

## Resources

- [Stripe Invoicing API](https://stripe.com/docs/api/invoices)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
