# Mobile Payments Setup

This project reuses the existing Premium pipeline for web, Google Play Billing, and Apple In-App Purchase.
It does **not** use a separate payments system.

## Source of truth

- Premium activation: `profiles`
- Acquisition tracking: `subscription_acquisitions`
- Creator commissions: `affiliate_commissions`
- Creator payouts: `creator_payout_requests`

## Google Play Billing

### Required environment variables

- `GOOGLE_PLAY_PACKAGE_NAME`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

### Expected product IDs

- `premium_monthly`
- `premium_yearly`

### How to test

Use Google Play Console internal testing or a closed testing track:

1. Install the app from the internal testing release.
2. Sign in with a test account.
3. Enter a creator link/code if you want to validate attribution.
4. Complete a Google Play sandbox purchase.
5. Confirm the backend validates the `purchaseToken`.
6. Verify Premium becomes active in `profiles`.
7. Verify `subscription_acquisitions` is updated.
8. Verify creator attribution creates commission rows in `affiliate_commissions` when the referrer is a creator.

## Apple In-App Purchase

### Required environment variables

- `APPLE_BUNDLE_ID`
- `APPLE_ISSUER_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_ENVIRONMENT=sandbox|production`

### Expected product IDs

- `premium_monthly`
- `premium_yearly`

### How to test

Use an Apple Sandbox Tester account:

1. Install the app build that contains the In-App Purchase flow.
2. Sign in with a normal app account.
3. Enter a creator link/code if you want to validate attribution.
4. Purchase Premium using a Sandbox Tester.
5. Confirm the backend validates the Apple transaction server-side.
6. Verify Premium becomes active in `profiles`.
7. Verify `subscription_acquisitions` is updated.
8. Verify creator attribution creates commission rows in `affiliate_commissions` when the referrer is a creator.

## Acceptance checklist

### Google

- User enters with creator code.
- User registers.
- User completes Google Play sandbox purchase.
- Backend validates `purchaseToken`.
- Premium becomes active.
- Creator commission is created at 30%.

### Apple

- User enters with creator code.
- User registers.
- User completes Apple sandbox purchase.
- Backend validates the transaction server-side.
- Premium becomes active.
- Creator commission is created at 30%.

## Notes

- Never trust `amount` coming from the frontend.
- `productId` and money values must come from the internal catalog.
- Duplicates are prevented by the existing acquisition/commission idempotency rules.
