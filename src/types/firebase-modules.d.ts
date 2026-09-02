/**
 * TypeScript Declarations for Firebase v10 SDK submodules
 */

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, unknown>;
    automaticDataCollectionEnabled?: boolean;
  }
  export function initializeApp(options: Record<string, unknown>): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }
  export interface UserCredential {
    user: User;
  }
  export interface Auth {
    currentUser: User | null;
  }
  export class GoogleAuthProvider {
    setCustomParameters(params: Record<string, string>): void;
  }
  export function getAuth(app?: unknown): Auth;
  export function onAuthStateChanged(
    auth: Auth,
    nextOrObserver: (user: User | null) => void | Promise<void>,
    error?: (error: Error) => void,
    completed?: () => void
  ): () => void;
  export function signInWithEmailAndPassword(
    auth: Auth,
    email: string,
    pass: string
  ): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(
    auth: Auth,
    email: string,
    pass: string
  ): Promise<UserCredential>;
  export function signInWithPopup(
    auth: Auth,
    provider: unknown
  ): Promise<UserCredential>;
  export function sendPasswordResetEmail(
    auth: Auth,
    email: string
  ): Promise<void>;
  export function updateProfile(
    user: User,
    profile: { displayName?: string; photoURL?: string }
  ): Promise<void>;
  export function signOut(auth: Auth): Promise<void>;
}

declare module 'firebase/firestore' {
  export interface Firestore {
    type: string;
  }
  export interface DocumentData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [field: string]: any;
  }
  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    ref: unknown;
    data(): T;
  }
  export interface WriteBatch {
    set(documentRef: unknown, data: DocumentData, options?: { merge?: boolean }): WriteBatch;
    update(documentRef: unknown, data: DocumentData): WriteBatch;
    delete(documentRef: unknown): WriteBatch;
    commit(): Promise<void>;
  }
  export interface QuerySnapshot<T = DocumentData> {
    docs: Array<QueryDocumentSnapshot<T>>;
    empty: boolean;
    size: number;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }
  export function getFirestore(app?: unknown): Firestore;
  export function collection(firestore: Firestore, ...pathSegments: string[]): unknown;
  export function doc(firestore: Firestore, ...pathSegments: string[]): unknown;
  export function getDocs(query: unknown): Promise<QuerySnapshot>;
  export function getDoc(reference: unknown): Promise<{ exists(): boolean; data(): DocumentData | undefined; id: string }>;
  export function setDoc(reference: unknown, data: DocumentData, options?: { merge?: boolean }): Promise<void>;
  export function updateDoc(reference: unknown, data: DocumentData): Promise<void>;
  export function deleteDoc(reference: unknown): Promise<void>;
  export function query(query: unknown, ...queryConstraints: unknown[]): unknown;
  export function where(fieldPath: string, opStr: string, value: unknown): unknown;
  export function limit(limit: number): unknown;
  export function writeBatch(firestore: Firestore): WriteBatch;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): unknown;
  export function serverTimestamp(): unknown;
}

declare module 'firebase/storage' {
  export interface FirebaseStorage {
    app: unknown;
  }
  export interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
  }
  export interface UploadTaskSnapshot {
    bytesTransferred: number;
    totalBytes: number;
    state: string;
  }
  export interface UploadTask extends Promise<UploadTaskSnapshot> {
    on(
      event: string,
      nextOrObserver?: (snapshot: UploadTaskSnapshot) => void,
      error?: (error: Error) => void,
      complete?: () => void
    ): () => void;
  }
  export function getStorage(app?: unknown): FirebaseStorage;
  export function ref(storage: FirebaseStorage, url?: string): StorageReference;
  export function uploadBytesResumable(
    ref: StorageReference,
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: Record<string, unknown>
  ): UploadTask;
  export function getDownloadURL(ref: StorageReference): Promise<string>;
  export function deleteObject(ref: StorageReference): Promise<void>;
}

