'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Message, Conversation, CitationSource, ImageAttachment } from '@/types/chat';
import type { UploadedDocument } from '@/types/document';
import type { PendingImage } from '@/components/chat/ImageAttachmentPreview';
import { streamChatResponse } from '@/lib/api/chat-client';
import { AI_CONFIG } from '@/config/ai';
import { MULTIMODAL_CONFIG } from '@/config/multimodal';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserConversations,
  getConversationMessages,
  createConversationDoc,
  renameConversationDoc,
  deleteConversationDoc,
  saveMessageDoc,
  deleteDocumentDoc,
} from '@/lib/firebase/firestore';
import { uploadUserImage, fileToBase64, getImageDimensions } from '@/lib/multimodal/image-service';
import { validateImageFile } from '@/lib/multimodal/image-validator';
import { generateConversationTitle } from '@/lib/utils/title-generator';

export function useChat() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('new');
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [attachedDocs, setAttachedDocs] = useState<UploadedDocument[]>([]);
  const [attachedImages, setAttachedImages] = useState<PendingImage[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(AI_CONFIG.defaultModel);
  const [capturedMemory, setCapturedMemory] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 1. Load user's conversations on login or initial mount
   */
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setMessages([]);
      setActiveConversationId('new');
      setAttachedDocs([]);
      setAttachedImages([]);
      return;
    }

    let isMounted = true;
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const userConvs = await getUserConversations(user.uid);
        if (isMounted) {
          setConversations(userConvs);
        }
      } catch (err) {
        console.warn('Failed to load conversations from Firestore:', err);
      } finally {
        if (isMounted) {
          setIsLoadingConversations(false);
        }
      }
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, [user]);

  /**
   * 2. Select conversation and load its messages
   */
  const selectConversation = useCallback(
    async (id: string) => {
      if (id === activeConversationId) return;

      setActiveConversationId(id);

      if (id === 'new' || !user) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const loadedMessages = await getConversationMessages(user.uid, id);
        setMessages(loadedMessages);
      } catch (err) {
        console.error('Failed to load conversation messages:', err);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [activeConversationId, user]
  );

  /**
   * 3. Start a fresh new chat
   */
  const newChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setActiveConversationId('new');
    setMessages([]);
    setAttachedDocs([]);
    setAttachedImages([]);
  }, []);

  /**
   * 4. Rename an existing conversation
   */
  const renameConversation = useCallback(
    async (id: string, newTitle: string) => {
      if (!newTitle.trim()) return;

      // Optimistic update
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim(), updatedAt: Date.now() } : c))
      );

      if (user) {
        try {
          await renameConversationDoc(user.uid, id, newTitle.trim());
        } catch (err) {
          console.error('Failed to persist conversation rename:', err);
        }
      }
    },
    [user]
  );

  /**
   * 5. Delete conversation
   */
  const deleteConversation = useCallback(
    async (id: string) => {
      // Optimistic update
      setConversations((prev) => prev.filter((c) => c.id !== id));

      if (activeConversationId === id) {
        newChat();
      }

      if (user) {
        try {
          await deleteConversationDoc(user.uid, id);
        } catch (err) {
          console.error('Failed to delete conversation from Firestore:', err);
        }
      }
    },
    [activeConversationId, newChat, user]
  );

  /**
   * 6. Stop streaming generation
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  }, []);

  /**
   * 7. Add attached images with validation & object URL preview
   */
  const addAttachedImages = useCallback(async (files: File[]) => {
    const validPending: PendingImage[] = [];

    for (const file of files) {
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error || 'Invalid image file.');
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validPending.push({
        id: `pending-img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        name: file.name,
        sizeBytes: file.size,
      });
    }

    if (validPending.length > 0) {
      setAttachedImages((prev) => {
        const combined = [...prev, ...validPending];
        if (combined.length > MULTIMODAL_CONFIG.maxImagesPerMessage) {
          alert(`You can attach up to ${MULTIMODAL_CONFIG.maxImagesPerMessage} images per message.`);
          return combined.slice(0, MULTIMODAL_CONFIG.maxImagesPerMessage);
        }
        return combined;
      });
    }
  }, []);

  /**
   * 8. Remove attached image
   */
  const removeAttachedImage = useCallback((id: string) => {
    setAttachedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  /**
   * 9. Send message & coordinate Gemini streaming + Multimodal upload + Firestore persistence
   */
  const sendMessage = useCallback(async () => {
    const hasText = input.trim().length > 0;
    const hasImages = attachedImages.length > 0;

    if ((!hasText && !hasImages) || isStreaming) return;

    const userPrompt = input.trim();
    const currentPendingImages = [...attachedImages];

    setInput('');
    setAttachedImages([]);

    let currentConvId = activeConversationId;

    // If starting from 'new', generate a real conversation ID and title
    if (currentConvId === 'new') {
      currentConvId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const title = userPrompt ? generateConversationTitle(userPrompt) : 'Image Analysis';

      const newConv: Conversation = {
        id: currentConvId,
        userId: user?.uid || 'anonymous',
        title,
        lastMessageText: userPrompt || '📷 [Image]',
        attachedDocumentIds: attachedDocs.map((d) => d.id),
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(currentConvId);

      // Persist conversation document
      if (user) {
        createConversationDoc(user.uid, currentConvId, title, userPrompt || '📷 [Image]').catch((err) =>
          console.warn('Could not persist conversation doc:', err)
        );
      }
    }

    // Process attached images instantly into memory
    let messageImages: ImageAttachment[] | undefined = undefined;
    if (currentPendingImages.length > 0) {
      const processed = await Promise.all(
        currentPendingImages.map(async (img) => {
          const base64Data = await fileToBase64(img.file);
          const dims = await getImageDimensions(img.file).catch(() => ({ width: 0, height: 0 }));
          const imgId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const ext = img.name.split('.').pop() || 'jpg';
          const storagePath = user ? `users/${user.uid}/images/${imgId}.${ext}` : '';

          const attachment: ImageAttachment = {
            id: imgId,
            userId: user?.uid || 'anonymous',
            conversationId: currentConvId,
            name: img.name,
            storagePath,
            mimeType: img.file.type || 'image/jpeg',
            sizeBytes: img.sizeBytes,
            width: dims.width || undefined,
            height: dims.height || undefined,
            url: base64Data,
            base64Data,
            createdAt: Date.now(),
          };
          return attachment;
        })
      );
      messageImages = processed;
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: currentConvId,
      role: 'user',
      content: userPrompt,
      images: messageImages,
      hasDocumentContext: attachedDocs.length > 0,
      hasWebSearchGrounding: webSearchEnabled,
      hasImageContext: !!(messageImages && messageImages.length > 0),
      createdAt: Date.now(),
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      conversationId: currentConvId,
      role: 'assistant',
      content: '',
      hasDocumentContext: attachedDocs.length > 0,
      hasWebSearchGrounding: webSearchEnabled,
      hasImageContext: !!(messageImages && messageImages.length > 0),
      isStreaming: true,
      createdAt: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, assistantMsg]);
    setIsStreaming(true);

    // Persist user message to Firestore
    if (user) {
      saveMessageDoc(user.uid, currentConvId, userMsg).catch((err) =>
        console.warn('Could not persist user message:', err)
      );

      // Non-blocking background upload to Firebase Storage
      if (currentPendingImages.length > 0 && messageImages) {
        currentPendingImages.forEach((img, idx) => {
          uploadUserImage(user.uid, img.file, currentConvId)
            .then((uploaded) => {
              if (uploaded.url && messageImages && messageImages[idx]) {
                messageImages[idx].url = uploaded.url;
                messageImages[idx].storagePath = uploaded.storagePath;
                saveMessageDoc(user.uid, currentConvId, {
                  ...userMsg,
                  images: messageImages,
                }).catch(() => {});
              }
            })
            .catch((err) => {
              console.warn('Background storage upload notice:', err);
            });
        });
      }
    }

    // Abort previous controller if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let fullAssistantResponse = '';
    let responseCitations: CitationSource[] | undefined = undefined;

    const readyDocIds = attachedDocs
      .filter((d) => d.status === 'ready')
      .map((d) => d.id);

    await streamChatResponse(updatedMessages, {
      modelId: selectedModel,
      documentIds: readyDocIds.length > 0 ? readyDocIds : undefined,
      webSearchEnabled,
      userId: user?.uid,
      signal: abortController.signal,
      onStatus: (status: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, searchStatus: status } : msg
          )
        );
      },
      onCitations: (citations: CitationSource[]) => {
        responseCitations = citations;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, citations } : msg
          )
        );
      },
      onChunk: (token: string) => {
        fullAssistantResponse += token;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: fullAssistantResponse, searchStatus: undefined }
              : msg
          )
        );
      },
      onError: (errorMsg: string) => {
        const errorFormatted =
          fullAssistantResponse.trim().length > 0
            ? `${fullAssistantResponse}\n\n> ⚠️ **Error:** ${errorMsg}`
            : `> ⚠️ **Unable to complete response:** ${errorMsg}`;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: errorFormatted, searchStatus: undefined, isStreaming: false }
              : msg
          )
        );
        setIsStreaming(false);

        // Persist error state if user message was sent
        if (user && fullAssistantResponse.trim().length > 0) {
          saveMessageDoc(user.uid, currentConvId, {
            ...assistantMsg,
            content: errorFormatted,
            citations: responseCitations,
            isStreaming: false,
          }).catch((err) => console.warn('Could not persist error message:', err));
        }
      },
      onComplete: () => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: fullAssistantResponse || msg.content,
                  citations: responseCitations,
                  searchStatus: undefined,
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsStreaming(false);

        // Persist final completed assistant message
        if (user && fullAssistantResponse.trim().length > 0) {
          saveMessageDoc(user.uid, currentConvId, {
            ...assistantMsg,
            content: fullAssistantResponse,
            citations: responseCitations,
            isStreaming: false,
          }).catch((err) => console.warn('Could not persist assistant message:', err));

          // Asynchronous non-blocking long-term memory extraction
          if (userPrompt) {
            fetch('/api/memory/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.uid,
                userMessage: userPrompt,
                assistantResponse: fullAssistantResponse,
                conversationId: currentConvId,
              }),
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => {
                if (data?.saved && data.saved.length > 0) {
                  const first = data.saved[0];
                  setCapturedMemory(first.content);
                }
              })
              .catch((err) => {
                console.warn('Background memory extraction notice:', err);
              });
          }
        }
      },
    });
  }, [
    input,
    attachedImages,
    isStreaming,
    activeConversationId,
    messages,
    selectedModel,
    attachedDocs,
    webSearchEnabled,
    user,
  ]);

  const addAttachedDoc = useCallback((doc: UploadedDocument) => {
    setAttachedDocs((prev) => {
      if (prev.some((d) => d.id === doc.id)) return prev;
      return [...prev, doc];
    });
  }, []);

  const removeAttachedDoc = useCallback(
    async (id: string) => {
      setAttachedDocs((prev) => prev.filter((d) => d.id !== id));
      if (user) {
        deleteDocumentDoc(user.uid, id).catch((err) =>
          console.warn('Document deletion cleanup notice:', err)
        );
      }
    },
    [user]
  );

  const toggleWebSearch = useCallback(() => {
    setWebSearchEnabled((prev) => !prev);
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    input,
    setInput,
    isStreaming,
    isLoadingConversations,
    isLoadingMessages,
    attachedDocs,
    attachedImages,
    webSearchEnabled,
    selectedModel,
    setSelectedModel,
    capturedMemory,
    setCapturedMemory,
    selectConversation,
    newChat,
    renameConversation,
    deleteConversation,
    sendMessage,
    stopStreaming,
    addAttachedDoc,
    removeAttachedDoc,
    addAttachedImages,
    removeAttachedImage,
    toggleWebSearch,
  };
}
