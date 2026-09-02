'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatBytes } from '@/lib/utils';
import { RAG_CONFIG } from '@/config/rag';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable } from 'firebase/storage';
import type { UploadedDocument } from '@/types/document';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded: (doc: UploadedDocument) => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onDocumentUploaded,
}: DocumentUploadModalProps) {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = RAG_CONFIG.maxPdfSizeBytes;

  const handleFile = (file: File) => {
    setErrorMessage(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF documents are supported at this time.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setErrorMessage(`File size exceeds the ${RAG_CONFIG.maxPdfSizeMb}MB maximum limit.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const startUpload = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setUploadProgress(15);
    setStatusMessage('Uploading document to secure storage...');

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userId = user?.uid || 'anonymous-user';
    const storagePath = `users/${userId}/documents/${docId}/${selectedFile.name}`;

    try {
      // 1. Upload to Firebase Storage if available (optional cloud archive)
      try {
        if (storage && user) {
          const storageReference = ref(storage, storagePath);
          const uploadTask = uploadBytesResumable(storageReference, selectedFile);

          uploadTask.on('state_changed', (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 40;
            setUploadProgress(Math.min(50, Math.round(15 + progress)));
          });

          await uploadTask;
        }
      } catch (storageErr) {
        console.warn('Storage upload notice (continuing direct RAG processing):', storageErr);
      }

      setUploadProgress(55);
      setStatusMessage('Extracting text & generating semantic chunks...');

      // 2. Send to Server RAG Ingestion Pipeline
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', userId);
      formData.append('documentId', docId);
      formData.append('storagePath', storagePath);

      setUploadProgress(75);
      setStatusMessage('Vectorizing with Gemini Embeddings (gemini-embedding-2)...');

      const response = await fetch('/api/rag/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process and index PDF document.');
      }

      setUploadProgress(100);
      setStatusMessage('Ready for questions!');

      const newDoc: UploadedDocument = {
        id: docId,
        userId,
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        mimeType: 'application/pdf',
        storagePath,
        pageCount: data.pageCount,
        chunkCount: data.chunkCount,
        status: 'ready',
        createdAt: Date.now(),
      };

      onDocumentUploaded(newDoc);

      setTimeout(() => {
        resetState();
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during upload.';
      setErrorMessage(msg);
      setUploadProgress(null);
      setStatusMessage('');
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    setStatusMessage('');
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Upload Document for RAG Analysis"
      description="Attach a PDF document to ask contextually grounded questions and extract verified insights."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Drag and Drop Zone */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-brand bg-brand/5 scale-[0.99]'
                : 'border-border-strong hover:border-brand/60 bg-surface-2 hover:bg-surface-3/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="p-3 rounded-full bg-surface-3 text-brand mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Click to browse or drop your PDF here
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              Supports PDF documents up to {RAG_CONFIG.maxPdfSizeMb}MB
            </p>
          </div>
        ) : (
          /* Selected File Card */
          <div className="p-4 rounded-xl bg-surface-2 border border-border-strong space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-brand/10 text-brand">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground truncate max-w-[240px]">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[11px] text-foreground-muted font-mono">
                    {formatBytes(selectedFile.size)} • PDF
                  </p>
                </div>
              </div>

              {uploadProgress === 100 && (
                <CheckCircle2 className="w-5 h-5 text-status-success" />
              )}
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-foreground-muted font-mono">
                  <span>{statusMessage || 'Processing document...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-xs text-status-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetState();
              onClose();
            }}
          >
            Cancel
          </Button>

          {selectedFile && uploadProgress === null && (
            <Button variant="primary" size="sm" onClick={startUpload}>
              {errorMessage ? 'Retry Upload' : 'Attach Document'}
            </Button>
          )}

          {uploadProgress !== null && uploadProgress < 100 && (
            <Button variant="primary" size="sm" disabled isLoading>
              Processing...
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
