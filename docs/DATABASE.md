# Database Architecture (Real Firestore)

Virasya uses **Firebase Firestore** as its primary database. It is not dummy data; all listings, profiles, and drafts are stored and synced in real-time.

## 🏗 Collections

### 1. `userProfiles`
- **Location**: `/userProfiles/{userId}`
- **Purpose**: Stores the identity and role of the user.
- **Key Fields**:
  - `role`: 'artisan' | 'buyer' (Critical for UI segmentation).
  - `preferredLanguage`: Used for the default UI translation.
- **Implementation**: Handled in `src/app/auth/page.tsx` during sign-in.

### 2. `products`
- **Location**: `/products/{productId}`
- **Purpose**: Central repository for all crafts.
- **Key Fields**:
  - `artisanId`: Links the product to the creator (Ownership).
  - `status`: 'Draft' | 'Published' (Visibility control).
  - `images`: Base64 strings for the prototype (scaled to Storage for production).
- **Implementation**: Fetched via `useCollection` in `src/app/marketplace/page.tsx`.

## 🔒 Security Logic
The `firestore.rules` file enforces:
- **Artisans**: Can only Edit/Delete their own products (`request.auth.uid == resource.data.artisanId`).
- **Buyers**: Can only read products where `status == 'Published'`.
- **Profiles**: Private to the owner.

## ⚡ Real-time Sync
We use the `useCollection` and `useDoc` hooks in `src/firebase/firestore/`. These use `onSnapshot` from the Firebase SDK, meaning if you update a price on one device, it reflects instantly on all others without a refresh.
