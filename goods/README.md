<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.
https://ai.studio/apps/0ead2210-bffe-4073-932b-e3db8e894177

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Testing checkout locally

Checkout needs **two processes** running at once: the Vite frontend (`npm run dev`) and the Express backend (`node server.js`), which handles Razorpay order creation and Printrove fulfillment. The frontend proxies `/api/*` requests to the backend — if only `npm run dev` is running, checkout fails with "Could not reach the payment server."

Either:
- Run `npm run dev:full` — starts both together in one terminal, output prefixed by process, or
- Run `npm run dev` and `node server.js` in two separate terminals.

The backend also needs `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` set in `.env` (Razorpay Dashboard → Settings → API Keys — test-mode `rzp_test_...` keys work for a local dry run) or it responds with a 503 explaining exactly that. It prints its configuration status on startup, so check the terminal running `node server.js` first if checkout errors are unclear.