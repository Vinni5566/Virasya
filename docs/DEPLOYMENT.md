# Deployment Alternatives

While the project is configured for Firebase App Hosting, you can easily deploy to **Vercel** or **Netlify** to avoid Google Cloud's premium tier requirements.

## 🔼 Vercel Deployment (Recommended)

1.  **Environment Variables**:
    Go to your Project Settings > Environment Variables and add:
    - `GEMINI_API_KEY`: Your key from AI Studio.
    - `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.: (Optional) If you want to move `firebaseConfig` out of the source code.

2.  **Build Settings**:
    Next.js defaults are perfect. Vercel will automatically detect the App Router.

3.  **Authentication**:
    In your Firebase Console, add your Vercel deployment URL (e.g., `virasya.vercel.app`) to the **Authorized Domains** list in the Authentication settings. This is required for Google Sign-In to work.

## 📦 Local Deployment Preview
To test a production build locally:
```bash
npm run build
npm run start
```

## ⚠️ Database Security
Before going live, ensure your `firestore.rules` are published via the Firebase Console to prevent unauthorized data access.
