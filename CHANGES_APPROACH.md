# Subscription & Simulated Payment Architecture — Implementation Guide

## 1. Executive Summary & Philosophy ("Why & How")

### The "Why"
Placement management systems require high availability for core university workflows (drive browsing, applying, resume uploads, placement statistics). When introducing paid student perks (such as comprehensive mock test series and async video interview studios), the primary technical risks are:
1. **Regression Risk**: Accidental disruption of free core placement workflows.
2. **Bundle Bloat**: Heavy payment SDKs, media libraries, and chart libraries slowing down the entire student experience.
3. **Gateway Lock-in**: Hardcoding mock logic directly into database calls, making it painful to swap in real gateways like Razorpay or Stripe later.
4. **Security Vulnerabilities**: Trusting client-side prices, leaking MCQ answers before submission, or allowing quota bypasses.

### The "How"
To address all these risks, the implementation adheres to five non-negotiable architectural tenets:
1. **Additive-Only Schema**: All Prisma changes only add new models and relations; existing tables (`User`, `StudentProfile`, `Drive`, `Application`) remain untouched.
2. **Clean Provider Pattern (`PaymentProvider`)**: All payment logic speaks through an interface (`createOrder`, `confirmPayment`). Swapping in Razorpay or Stripe is a matter of adding one adapter file without touching the database schema or UI.
3. **Server-Authoritative Entitlements**: Client hints exist only for UI indicators (e.g. badges); all route handlers, actions, and page access verify entitlements server-side.
4. **Zero New Runtime Dependencies**: Built entirely with native APIs (Web MediaRecorder, Intl date & currency formatting, native dialogs, dynamic imports), resulting in **zero** increase to existing student first-load JS.
5. **Feature Flag Kill Switch**: Controlled by `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED`. When `false`, all new routes 404, navigation items vanish, and the portal operates exactly as before.

---

## 2. Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 15 App Router                │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌──────────────┐   ┌────────────────┐   ┌─────────────────┐
│ Student UI   │   │ Entitlement    │   │ Payment Adapter │
│ & Per-Route  │   │ Guard Engine   │   │ Abstraction     │
│ Client Leaf  │   │ (lib/          │   │ (lib/payments/) │
│ Wrappers     │   │ subscription/) │   │                 │
└──────┬───────┘   └────────┬───────┘   └────────┬────────┘
       │                    │                    │
       │                    ▼                    ▼
       │             React cache()       MockProvider
       │           + unstable_cache      (Swap-ready for
       │          (Single DB lookup)     Razorpay/Stripe)
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
               Prisma PostgreSQL Database
```

---

## 3. Data Model (`prisma/schema.prisma`)

All changes are additive. Existing models maintain 100% backward compatibility:

- **`PlanTier`**: `PRO`, `PREMIUM`
- **`SubscriptionStatus`**: `PENDING`, `ACTIVE`, `EXPIRED`, `CANCELED`
- **`PaymentStatus`**: `CREATED`, `PAID`, `FAILED`, `REFUNDED`
- **`PaymentProviderName`**: `MOCK` (expandable to `RAZORPAY`, `STRIPE`)
- **`Plan`**: Stores prepaid tiers (30-day Pro, 30-day Premium, 365-day Pro Discounted) with pricing in paise and typed entitlement JSON.
- **`Subscription`**: Records active period start/end dates. Expired subscriptions fall back to FREE tier lazily upon evaluation.
- **`Payment`**: Records order ID, payment ref, paise amounts, receipt numbers (`TPO-YYYY-XXXXXX`), and status.
- **`UsageCounter`**: Atomic monthly quota tracker (`@@unique([studentId, featureKey, periodKey])`) ensuring students cannot exceed plan quotas.
- **`MockTestPackage` & `MockTest`**: Organizes aptitude and technical tests by difficulty and tier. Free preview tests bypass quotas.
- **`MockQuestion`**: Secure question model where `correctIndex` and `explanation` are omitted in pre-submission queries.
- **`MockAttempt`**: Autosaved attempts with negative marking scoring on submit.
- **`VideoInterviewTemplate` & `VideoInterviewSession`**: Async self-practice video sessions with native camera recording, bitrate caps, 1-retake limits, self-ratings, and reviewer feedback.

---

## 4. Entitlement Engine (`lib/subscription/`)

- **`getStudentEntitlements(userId)`**: Wrapped in React `cache()`. Returns `{ tier, isActive, expiresAt, features, daysLeft }`. If a student has no subscription or an expired subscription, it safely defaults to `FREE_TIER_LIMITS`.
- **`assertEntitlement(userId, featureKey)`**: Throws a typed `EntitlementError` (HTTP 402/403) with `{ error, code: 'UPGRADE_REQUIRED', requiredTier }`.
- **`consumeQuota(studentId, featureKey, userId)`**: Transactionally checks and increments monthly usage counters, returning HTTP 402 with `QUOTA_EXHAUSTED` if the limit is reached.
- **`Gate.tsx`**: Lightweight server component providing inline upgrade banners when a perk is locked.

---

## 5. Payment Flow & Gateway Adapter Architecture

### Simulated Payment Flow (Safe & Realistic)
1. **Initiate Checkout (`POST /api/student/subscription/checkout`)**:
   - Resolves plan price securely from DB in paise (never trusting client input).
   - Generates simulated provider order ID `mock_order_<uuid>`.
   - Creates `Payment` with status `CREATED`.
2. **Client Checkout Modal (`MockCheckout.tsx` & `MockCheckout.module.css`)**:
   - Minimalist, sleek dark glassmorphism modal with fixed backdrop overlay and spring entrance animation.
   - Plan card with duration pill, clean price typography, and instant simulated method switcher (UPI / VPA, Card, NetBanking).
   - Interactive 3-card sandbox scenario selector (Success, Bank Decline, User Cancelled) replacing bulky radio fieldsets.
   - **Zero sensitive data collection**: Purely simulated sandbox interface with subtle security disclosures.
3. **Confirm Payment (`POST /api/student/subscription/confirm`)**:
   - Verifies ownership and idempotency (repeating confirm returns stored result).
   - In a single Prisma transaction: marks Payment `PAID`, activates/extends Subscription duration, generates unique receipt number, and posts an in-app notification.
4. **Printable Receipt (`/student/subscription/receipt/[paymentId]`)**:
   - Server-rendered HTML with print-ready CSS (`@media print`), demo watermark, and billed-to details.

### How to Swap in a Real Payment Gateway (e.g., Razorpay / Stripe)
The entire codebase connects to `PaymentProvider` via `lib/payments/index.ts`. To integrate a live gateway:
1. Create `lib/payments/razorpay-provider.ts`:
   ```typescript
   import { PaymentProvider, CreateOrderInput, ConfirmPaymentInput } from './types';
   import Razorpay from 'razorpay';

   export class RazorpayProvider implements PaymentProvider {
     name = 'RAZORPAY';
     async createOrder(input: CreateOrderInput) {
       // Call razorpay.orders.create(...)
       return { providerOrderId: order.id, amountPaise: order.amount, currency: 'INR' };
     }
     async confirmPayment(input: ConfirmPaymentInput) {
       // Verify razorpay signature with crypto.createHmac
       return { status: 'PAID', providerPaymentId: input.providerPaymentId };
     }
   }
   ```
2. Update `lib/payments/index.ts`:
   ```typescript
   export function getPaymentProvider(): PaymentProvider {
     const provider = process.env.PAYMENT_PROVIDER || 'mock';
     if (provider === 'razorpay') return new RazorpayProvider();
     return new MockPaymentProvider();
   }
   ```
3. Set environment variable `PAYMENT_PROVIDER=razorpay` in production. **No UI or schema rewrite is required.**

---

## 6. Bundle Size & Performance Verification

Next.js 15 App Router production build metrics:
```
Route (app)                                          Size     First Load JS
├ ƒ /student/dashboard                              917 B        108 kB
├ ƒ /student/subscription                         2.02 kB        105 kB
├ ƒ /student/mock-tests                             597 B        107 kB
├ ƒ /student/mock-tests/attempt/[attemptId]       1.38 kB        105 kB
├ ƒ /student/mock-tests/result/[attemptId]          692 B        108 kB
├ ƒ /student/video-interviews                       629 B        107 kB
└ ƒ /student/video-interviews/[sessionId]         1.47 kB        105 kB
+ First Load JS shared by all                                   103 kB
```

### Highlights:
- **Zero Bundle Bloat**: All student pages load in ~105–108 kB First Load JS.
- **Heavy Client Isolation**: `MockCheckoutModal`, `DynamicTestRunner`, and `DynamicVideoRecorder` are isolated into client-only chunks loaded strictly on demand.
- **Native Media APIs**: Uses browser-native `MediaRecorder` capped at 800 kbps (640x360), eliminating external WebRTC/recording library dependencies.

---

## 7. Verification & Smoke Test Results

Run the verification suite anytime via:
```bash
npx tsx scripts/verify-subscriptions.ts
```

### Automated Smoke Tests (`scripts/verify-subscriptions.ts`):
- ✅ Student defaults to `FREE` tier when no subscription exists.
- ✅ Free preview tests are accessible while gated packages enforce upgrade locks.
- ✅ Monthly quota counter increments atomically and rejects overdrafts.
- ✅ Negative marking algorithm scores accurately (e.g. 2 correct + 1 wrong = 3.5 marks).
- ✅ Simulated payment provider confirms idempotently without double-extension.
- ✅ TypeScript compilation (`tsc --noEmit`) passes with 0 errors.
- ✅ Next.js 15 production build (`next build`) compiles all 51 routes cleanly.

---

## 8. Manual QA Walkthrough Checklist

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Feature Flag OFF** | Set `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED=false` | Nav items hidden, `/student/subscription` returns 404, standard portal unaffected. |
| **2. Feature Flag ON** | Set `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED=true` | Sidebar shows Mock Tests, Video Interviews, Subscription & Tier Badge. |
| **3. Free Student Experience** | Open `/student/mock-tests` as Free Student | Aptitude test is open; FAANG CS package is locked with an "Upgrade" CTA. |
| **4. Simulated Payment** | Click "Upgrade to Pro" -> choose "Simulate Successful Payment" | Modal runs simulated network delay, confirms order, shows receipt #, and unlocks PRO immediately. |
| **5. Failure Simulation** | Click "Upgrade" -> choose "Simulate Payment Failure" | Displays friendly error message; user remains on current tier; no invalid subscription created. |
| **6. Mock Test Runner** | Take test at `/student/mock-tests/attempt/[id]` | Server-driven countdown timer, 15s autosave, and instantaneous server-scored results page. |
| **7. Video Interview Studio** | Record answer at `/student/video-interviews/[id]` | Camera feed initializes, think countdown fires, 1-retake limit enforced, self-rating reflection saves. |
| **8. Admin Oversight** | Visit `/admin/subscriptions` | Aggregate stats (subscribers, tier breakdown, mock revenue) and manual grant tool are operational. |
