# Tha Bronx 3 Best Plug rebuild

A responsive storefront inspired by the prior Tha Bronx 3 Best Plug page, with the recovered five products/prices, cart, checkout form, Cash App instructions, and a unique private receipt link per order.

## Preview
Open `index.html` in a browser. Without Supabase configured, it runs in **preview/demo mode** and stores orders only in that browser's local storage. Demo orders are not real server orders and receipts will not transfer between devices.

## Live deployment
1. Follow `supabase/README.md` to create the backend and deploy Edge Functions.
2. Edit `config.js` with your Supabase project URL and public anon/publishable key.
3. Upload all storefront files (`index.html`, `styles.css`, `app.js`, `config.js`, `receipt.html`, `receipt.js`) to your GitHub Pages repository.
4. Configure CORS to the production site origin and test a low-value order.
5. Verify a Cash App transfer manually before changing an order to paid using the protected `mark-paid` function.

## Products
- 990K — $1.50
- 2 Million — $2.50
- 10 Dupes — $1.50
- 20 Dupes — $2.50
- Stacked Alt — $5.00

## Important
Regular Cash App tag payments cannot be securely auto-confirmed by this website. The order is created first and stays pending until verified. The storefront never asks for payment login credentials. The design and item artwork here are a fresh approximation, not a pixel-perfect copy of the referenced site; replace the illustrative symbols with assets you own if needed.
