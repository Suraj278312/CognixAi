'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DocumentUploadModal } from '@/features/documents/DocumentUploadModal';
import { MemoryManagerModal } from '@/features/memory/MemoryManagerModal';
import { SettingsModal } from '@/features/settings/SettingsModal';
import { MemoryToast } from '@/features/memory/MemoryToast';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useMemory } from '@/hooks/useMemory';
import { ChatCanvas } from '@/components/chat/ChatCanvas';
import { CognixLogo } from '@/components/ui/CognixLogo';
import { AlertTriangle } from 'lucide-react';

export default function DashboardLayout() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { activeMemoriesCount } = useMemory();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [memoryManagerOpen, setMemoryManagerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const {
    conversations,
    activeConversationId,
    messages,
    input,
    setInput,
    isStreaming,
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
  } = useChat();

  // Route protection: redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // If resolving auth state, render calm minimalist loader
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="p-2 rounded-2xl bg-surface-2 border border-border-strong flex items-center justify-center animate-pulse">
            <CognixLogo variant="symbol" size="lg" asLink={false} />
          </div>
          <span className="text-xs font-mono text-foreground-muted">Loading Cognix...</span>
        </div>
      </div>
    );
  }

  // Active conversation object for header title
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const confirmDelete = async () => {
    if (deleteTargetId) {
      await deleteConversation(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-background text-foreground">
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={newChat}
        onRenameConversation={renameConversation}
        onRequestDeleteConversation={(id) => setDeleteTargetId(id)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenMemoryManager={() => setMemoryManagerOpen(true)}
        activeMemoriesCount={activeMemoriesCount}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          webSearchEnabled={webSearchEnabled}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenMemoryManager={() => setMemoryManagerOpen(true)}
          onSignOut={async () => {
            await signOut();
            router.push('/login');
          }}
          conversationTitle={activeConversation?.title || 'New Conversation'}
        />

        {/* Dynamic Chat Canvas */}
        <ChatCanvas
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSendMessage={sendMessage}
          onSelectPrompt={(promptText) => {
            setInput(promptText);
          }}
          isStreaming={isStreaming}
          onStopStreaming={stopStreaming}
          attachedDocs={attachedDocs}
          onRemoveDoc={removeAttachedDoc}
          onOpenDocUpload={() => setDocUploadOpen(true)}
          attachedImages={attachedImages}
          onAddImages={addAttachedImages}
          onRemoveImage={removeAttachedImage}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={toggleWebSearch}
          onRegenerate={() => {
            if (messages.length > 0) {
              const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
              if (lastUserMsg) {
                setInput(lastUserMsg.content);
              }
            }
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Delete conversation?"
        description="This conversation and its messages will be permanently deleted."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-xs text-status-error">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This action cannot be undone.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTargetId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Upload Dropzone Modal */}
      <DocumentUploadModal
        isOpen={docUploadOpen}
        onClose={() => setDocUploadOpen(false)}
        onDocumentUploaded={addAttachedDoc}
      />

      {/* Long-Term Memory Manager Modal */}
      <MemoryManagerModal
        isOpen={memoryManagerOpen}
        onClose={() => setMemoryManagerOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenMemoryManager={() => setMemoryManagerOpen(true)}
      />

      {/* Memory Toast Alert */}
      <MemoryToast
        memoryContent={capturedMemory}
        onClose={() => setCapturedMemory(null)}
        onOpenManager={() => {
          setCapturedMemory(null);
          setMemoryManagerOpen(true);
        }}
      />
    </div>
  );
}
