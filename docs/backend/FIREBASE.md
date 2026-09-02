# Firebase Backend Architecture & Configuration — Cognix

**Document Version:** 1.0.0  
**Backend Lead:** Lead Backend & Cloud Architect  

---

## 1. Firebase Ecosystem Overview

Cognix leverages Google Firebase as its core serverless backend infrastructure:

```text
┌────────────────────────────────────────────────────────┐
│                   FIREBASE SERVICES                    │
├────────────────────┬───────────────────────────────────┤
│ Service            │ Application Responsibility        │
├────────────────────┼───────────────────────────────────┤
│ Firebase Auth      │ User identity, OAuth, JWT tokens  │
│ Cloud Firestore    │ NoSQL real-time document database │
│ Cloud Storage      │ Uploaded PDF file blob store      │
│ Firebase App Check │ Bot mitigation & request integrity│
│ Firebase Admin SDK │ Server-side token verification    │
└────────────────────┴───────────────────────────────────┘
```

---

## 2. SDK Initialization Patterns

To ensure security boundaries, Cognix employs two separate SDK configurations:

### 2.1 Client SDK (`src/lib/firebase/client.ts`)
Initialized on the browser using safe, public `NEXT_PUBLIC_` environment variables:
```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 2.2 Server Admin SDK (`src/lib/firebase/admin.ts`)
Initialized exclusively in Node.js server environments with privileged credentials:
```typescript
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
```

---

## 3. Local Development with Firebase Emulators

For offline development and automated testing, Cognix supports the **Firebase Emulator Suite**:
- **Auth Emulator**: Port `9099`
- **Firestore Emulator**: Port `8080`
- **Storage Emulator**: Port `9199`
- **Emulator UI**: Port `4000`

### Starting the Emulators
```bash
firebase emulators:start
```
When `process.env.NODE_ENV === 'development'` and `process.env.USE_FIREBASE_EMULATORS === 'true'`, client SDKs automatically connect to localhost emulator ports via `connectFirestoreEmulator`, `connectAuthEmulator`, and `connectStorageEmulator`.
