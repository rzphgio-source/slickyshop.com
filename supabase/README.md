# Supabase setup

1. Create a Supabase project.
2. In SQL Editor, run `schema.sql`.
3. Set frontend URL and anon/publishable key in `../config.js`. Never expose the service-role key in frontend files.
4. Deploy the functions:
   - `supabase functions deploy create-order`
   - `supabase functions deploy get-receipt`
   - `supabase functions deploy mark-paid`
5. Configure function secrets in Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only; Supabase usually provides these automatically to Edge Functions)
   - `ORDER_ADMIN_SECRET` (a long random secret you generate and keep private)
6. In the website, order creation calls `create-order`; the server recalculates prices and stores an order with status `pending`. The receipt link has a random token; only its SHA-256 hash is stored.
7. After independently confirming the Cash App transfer in your own account, call `mark-paid` from a trusted admin environment. Do not call it from the public storefront.

Example admin request (run privately; never paste the secret into website files):
`curl -X POST 'https://YOUR-PROJECT.supabase.co/functions/v1/mark-paid' -H 'Authorization: Bearer YOUR_ORDER_ADMIN_SECRET' -H 'Content-Type: application/json' --data '{"order_id":"ORDER_UUID"}'`

## Cash App limitations
A personal Cash App tag does not provide a trusted automatic payment confirmation webhook for this storefront. Checkout opens Cash App, but an order remains pending until a human verifies the incoming transfer and uses the protected admin function. Do not ask customers for Cash App passwords, PINs, or verification codes. Never treat a screenshot or customer's click as proof of payment.

## CORS
For production, change `Access-Control-Allow-Origin` in `_shared/cors.ts` from `*` to your exact storefront origin, e.g. `https://YOUR-USERNAME.github.io`. If using GitHub Pages under a project path, the origin still contains only scheme + host.
