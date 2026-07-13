# Design: Ticket Download + Payment Status Change

## Context

The bakery webapp "La Flor de Azúcar" has two UX gaps:

1. The ticket modal only offers "Print" — impractical on mobile where most customers browse
2. The admin panel can change order status but not payment status — problematic for in-person cash payments

## Feature 1: Download Ticket as Image

### Goal

Allow customers to download their ticket (order summary + QR code) as a PNG image from the confirmation modal.

### Implementation

- **Library**: `html2canvas` — captures DOM elements as canvas, then exports to PNG
- **Trigger**: New button "Descargar ticket" next to existing "Imprimir ticket" button
- **Behavior**: Captures `#ticketContent` div → converts to canvas → creates download link with filename `ticket-{codigo}.png`

### Files to modify

| File | Change |
|------|--------|
| `bakery-frontend/package.json` | Add `html2canvas` dependency |
| `bakery-frontend/.../ticket-modal.ts` | Add `downloadTicket()` method |
| `bakery-frontend/.../ticket-modal.html` | Add download button in footer |

### Edge cases

- If `html2canvas` fails (CORS issue with external images), show alert
- QR image is a dataURL (base64), so no CORS issues there
- Product images come from Unsplash URLs — html2canvas handles cross-origin images by default (draws them but may taint canvas). Since we only need the QR + text, this is acceptable

## Feature 2: Payment Status Change in Admin

### Goal

Allow admins to change `estado_pago` between `pendiente`, `pagado`, and `reembolsado` from the orders table.

### Backend

New endpoint: `PATCH /pedidos/:id/estado-pago`

- Auth: `authMiddleware` + `adminMiddleware`
- Body: `{ estado_pago: 'pendiente' | 'pagado' | 'reembolsado' }`
- Validation: `express-validator` with whitelist
- Response: updated order row
- Controller: `orderController.updatePaymentStatus`

### Frontend

- New method `updatePaymentStatus(orderId, estadoPago)` in `admin.ts`
- Dropdown in the "Pago" column of the orders table (next to the existing status badge)
- Dropdown in the QR scanner result card
- Visual feedback: badge updates immediately after change

### Files to modify

| File | Change |
|------|--------|
| `backend/src/controllers/orderController.js` | Add `updatePaymentStatus` method |
| `backend/src/routes/index.js` | Add `PATCH /pedidos/:id/estado-pago` route |
| `backend/src/middleware/validators.js` | Add `estadoPagoRules` validator |
| `bakery-frontend/.../admin.ts` | Add `updatePaymentStatus()` method |
| `bakery-frontend/.../admin.html` | Add dropdowns in orders table + QR card |

### Edge cases

- Only admin users can change payment status (enforced by middleware)
- Invalid values rejected by CHECK constraint in DB + validator on server
- No email notification for payment status changes (unlike order status changes)

## Feature 3: Ticket Modal from Public Verification

### Goal

When a customer verifies their order via the public `/verify/:codigo` page, show a "Ver ticket" button that opens the same ticket modal with download option. This allows customers who closed the page to retrieve their ticket later.

### Implementation

- When verifier finds an order successfully (`result.ok === true`), show a "Ver ticket" button
- Clicking it opens `TicketModal` component with the verified order data
- The ticket modal already has download + print functionality (from Feature 1)
- `TicketModal` is imported into `Verifier` component

### Files to modify

| File | Change |
|------|--------|
| `bakery-frontend/.../verifier.ts` | Import `TicketModal`, add `ticketOpen` signal, `openTicket()` method |
| `bakery-frontend/.../verifier.html` | Add "Ver ticket" button after successful verification + `<app-ticket-modal>` |

### Edge cases

- Ticket modal only opens when verification is successful
- Modal closes cleanly, verifier state preserved
- No auth required (public page)

## Testing

- Manual: Create order → verify ticket downloads as PNG
- Manual: Admin panel → change payment status → verify badge updates
- Manual: Non-admin user → verify 403 on payment status endpoint
- Manual: Visit `/verify/BKR-XXXXXXXX` → verify order → click "Ver ticket" → download works
