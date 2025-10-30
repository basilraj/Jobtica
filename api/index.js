import 'dotenv/config'; // Ensure dotenv is loaded first
import app from './app.js';
import process from 'process';

// Determine the port based on environment variable or default to 3001
const PORT = process.env.PORT || 3001;

// This logic ensures the server starts listening when the file is directly executed (e.g., `node api/index.js`)
// but doesn't try to start a listener when used in a serverless environment (where the `app` is exported
// and handled by the platform's runtime, e.g., Vercel or Cloud Functions).
// The VERCEL environment variable is specific to Vercel. For Render, we want it to listen.
// The `start` script will ensure it listens. For `dev`, concurrently handles it.
if (process.env.NODE_ENV !== 'production' || (!process.env.VERCEL && !process.env.FUNCTION_TARGET)) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// For serverless functions (like Vercel or Google Cloud Functions), the app itself is exported.
// The hosting platform will handle listening for requests.
export default app;