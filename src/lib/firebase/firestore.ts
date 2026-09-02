/**
 * Firestore Database Persistence Service — Cognix
 * Multi-tenant partition: users/{userId}/conversations/{conversationId}/messages/{messageId}
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './client';
import type { Conversation, Message } from '@/types/chat';
import type { User } from 'firebase/auth';

/**
 * 1. USER PROFILE MANAGEMENT
 */
export async function syncUserProfile(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Failed to sync user profile to Firestore:', error);
  }
}

/**
 * 2. CONVERSATION RETRIEVAL & CRUD
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const convColRef = collection(db, 'users', userId, 'conversations');
    const q = query(convColRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId || userId,
        title: data.title || 'Conversation',
        lastMessageText: data.lastMessagePreview || data.lastMessageText || '',
        updatedAt: data.updatedAt || Date.now(),
        createdAt: data.createdAt || Date.now(),
        isPinned: data.isPinned || false,
      };
    });
  } catch (error) {
    console.warn('Firestore getUserConversations error (falling back to memory):', error);
    return [];
  }
}

export async function createConversationDoc(
  userId: string,
  conversationId: string,
  title: string,
  firstMessagePreview: string
): Promise<void> {
  try {
    const convDocRef = doc(db, 'users', userId, 'conversations', conversationId);
    await setDoc(convDocRef, {
      id: conversationId,
      userId,
      title,
      lastMessagePreview: firstMessagePreview.slice(0, 100),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to create conversation document:', error);
    throw error;
  }
}

export async function renameConversationDoc(
  userId: string,
  conversationId: string,
  newTitle: string
): Promise<void> {
  try {
    const convDocRef = doc(db, 'users', userId, 'conversations', conversationId);
    await updateDoc(convDocRef, {
      title: newTitle,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to rename conversation document:', error);
    throw error;
  }
}

export async function deleteConversationDoc(
  userId: string,
  conversationId: string
): Promise<void> {
  try {
    // Delete all messages inside the subcollection first
    const msgColRef = collection(
      db,
      'users',
      userId,
      'conversations',
      conversationId,
      'messages'
    );
    const msgSnap = await getDocs(msgColRef);
    const deletePromises = msgSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    // Delete the conversation document
    const convDocRef = doc(db, 'users', userId, 'conversations', conversationId);
    await deleteDoc(convDocRef);
  } catch (error) {
    console.error('Failed to delete conversation document:', error);
    throw error;
  }
}

/**
 * 3. MESSAGE RETRIEVAL & PERSISTENCE
 */
export async function getConversationMessages(
  userId: string,
  conversationId: string
): Promise<Message[]> {
  try {
    const msgColRef = collection(
      db,
      'users',
      userId,
      'conversations',
      conversationId,
      'messages'
    );
    const q = query(msgColRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        conversationId,
        role: data.role,
        content: data.content || '',
        images: data.images || undefined,
        createdAt: data.createdAt || Date.now(),
        citations: data.citations || undefined,
      };
    });
  } catch (error) {
    console.warn('Firestore getConversationMessages error:', error);
    return [];
  }
}

export async function saveMessageDoc(
  userId: string,
  conversationId: string,
  message: Message
): Promise<void> {
  try {
    const msgDocRef = doc(
      db,
      'users',
      userId,
      'conversations',
      conversationId,
      'messages',
      message.id
    );

    const sanitizedImages =
      message.images?.map((img) => ({
        id: img.id,
        userId,
        conversationId,
        name: img.name,
        storagePath: img.storagePath,
        mimeType: img.mimeType,
        sizeBytes: img.sizeBytes,
        width: img.width || null,
        height: img.height || null,
        url: img.url || null,
        createdAt: img.createdAt || Date.now(),
      })) || null;

    await setDoc(msgDocRef, {
      id: message.id,
      conversationId,
      userId,
      role: message.role,
      content: message.content,
      images: sanitizedImages,
      createdAt: message.createdAt || Date.now(),
      citations: message.citations || null,
    });

    // Update conversation's lastMessagePreview and updatedAt
    const previewText = message.content.trim()
      ? message.content.slice(0, 100)
      : message.images && message.images.length > 0
      ? `📷 [Image: ${message.images[0].name}]`
      : '';

    const convDocRef = doc(db, 'users', userId, 'conversations', conversationId);
    await updateDoc(convDocRef, {
      lastMessagePreview: previewText,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to save message document:', error);
    throw error;
  }
}

/**
 * 4. USER DOCUMENTS MANAGEMENT (PDF RAG)
 * Path: users/{userId}/documents/{documentId}
 */
export async function getUserDocuments(userId: string): Promise<import('@/types/document').UploadedDocument[]> {
  try {
    const docsColRef = collection(db, 'users', userId, 'documents');
    const q = query(docsColRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId || userId,
        fileName: data.fileName || 'document.pdf',
        fileSizeBytes: data.fileSizeBytes || 0,
        mimeType: data.mimeType || 'application/pdf',
        storagePath: data.storagePath || '',
        pageCount: data.pageCount || undefined,
        chunkCount: data.chunkCount || undefined,
        status: data.status || 'ready',
        errorMessage: data.errorMessage || undefined,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      };
    });
  } catch (error) {
    console.warn('Firestore getUserDocuments error:', error);
    return [];
  }
}

export async function saveDocumentDoc(
  userId: string,
  docData: import('@/types/document').UploadedDocument
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'documents', docData.id);
    await setDoc(
      docRef,
      {
        id: docData.id,
        userId,
        fileName: docData.fileName,
        fileSizeBytes: docData.fileSizeBytes,
        mimeType: docData.mimeType,
        storagePath: docData.storagePath,
        pageCount: docData.pageCount || null,
        chunkCount: docData.chunkCount || null,
        status: docData.status,
        errorMessage: docData.errorMessage || null,
        createdAt: docData.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save document metadata in Firestore:', error);
    throw error;
  }
}

export async function updateDocumentStatus(
  userId: string,
  documentId: string,
  status: import('@/types/document').DocumentStatus,
  updates?: Partial<import('@/types/document').UploadedDocument>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'documents', documentId);
    await updateDoc(docRef, {
      status,
      updatedAt: Date.now(),
      ...(updates || {}),
    });
  } catch (error) {
    console.error('Failed to update document status in Firestore:', error);
    throw error;
  }
}

export async function deleteDocumentDoc(
  userId: string,
  documentId: string
): Promise<void> {
  try {
    // 1. Delete all chunks in subcollection
    const chunksColRef = collection(db, 'users', userId, 'documents', documentId, 'chunks');
    const chunksSnap = await getDocs(chunksColRef);
    const deletePromises = chunksSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    // 2. Delete parent document record
    const docRef = doc(db, 'users', userId, 'documents', documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Failed to delete document from Firestore:', error);
    throw error;
  }
}

