'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal } from '@/components/ui/Modal';
import { CognixLogo } from '@/components/ui/CognixLogo';
import { CodeBlock } from '@/components/chat/CodeBlock';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { useTheme } from '@/hooks/useTheme';
import {
  Sparkles,
  Search,
  Sun,
  Moon,
} from 'lucide-react';

export default function DesignSystemTestPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [composerInput, setComposerInput] = useState('');
  const [searchToggle, setSearchToggle] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-12 space-y-16 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <CognixLogo size="lg" asLink={false} />
            <Badge variant="brand">Design System Verification</Badge>
          </div>
          <p className="text-xs text-foreground-muted">
            Internal UI token, typography, and atomic component verification suite.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          leftIcon={resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        >
          {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          1. Surface & Tonal Palette Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-lg bg-background border border-border-strong space-y-1">
            <div className="font-semibold text-foreground">bg-background</div>
            <div className="text-[11px] text-foreground-muted">--bg-app</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-1 border border-border-strong space-y-1">
            <div className="font-semibold text-foreground">bg-surface-1</div>
            <div className="text-[11px] text-foreground-muted">--bg-surface-1</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-2 border border-border-strong space-y-1">
            <div className="font-semibold text-foreground">bg-surface-2</div>
            <div className="text-[11px] text-foreground-muted">--bg-surface-2</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-3 border border-border-strong space-y-1">
            <div className="font-semibold text-foreground">bg-surface-3</div>
            <div className="text-[11px] text-foreground-muted">--bg-surface-3</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-brand text-white font-semibold">
            Brand Primary
          </div>
          <div className="p-3 rounded-lg bg-brand-accent text-slate-950 font-semibold">
            Brand Accent
          </div>
          <div className="p-3 rounded-lg bg-status-success/20 text-status-success border border-status-success/30 font-semibold">
            Status Success
          </div>
          <div className="p-3 rounded-lg bg-status-error/20 text-status-error border border-status-error/30 font-semibold">
            Status Error
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          2. Typography Scale (Inter Sans-Serif)
        </h2>
        <div className="space-y-3 bg-surface-1 p-6 rounded-xl border border-border-subtle">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Display Heading 1 (text-3xl font-bold)
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Section Heading 2 (text-2xl font-semibold)
          </h2>
          <h3 className="text-xl font-medium tracking-tight text-foreground">
            Subheading 3 (text-xl font-medium)
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            Body regular text (text-sm). Cognix is designed to feel calm, intelligent, and distraction-free. Line height and spacing are calibrated for long reading sessions.
          </p>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Muted metadata text (text-xs). Useful for timestamps, citation snippets, and helper text.
          </p>
          <code className="block text-xs font-mono p-2.5 rounded bg-surface-2 text-brand border border-border-subtle">
            Monospace code sample: const cognix = new CognixClient();
          </code>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          3. Button Variants & States
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="md" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            Primary Action
          </Button>
          <Button variant="secondary" size="md">
            Secondary
          </Button>
          <Button variant="outline" size="md">
            Outline
          </Button>
          <Button variant="ghost" size="md">
            Ghost
          </Button>
          <Button variant="danger" size="md">
            Danger
          </Button>
          <Button variant="subtle" size="md">
            Subtle
          </Button>
          <Button variant="primary" size="md" isLoading>
            Loading
          </Button>
          <Button variant="primary" size="md" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          4. Inputs & Search Fields
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Search Query"
            placeholder="Type to search..."
            leftIcon={<Search className="w-4 h-4 text-foreground-muted" />}
          />
          <Input
            label="API Key"
            placeholder="AIzaSy..."
            hint="Stored securely in memory"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          5. Badges & Tooltips
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="brand">Brand Badge</Badge>
          <Badge variant="success">Active / Grounded</Badge>
          <Badge variant="warning">Syncing</Badge>
          <Badge variant="error">Offline</Badge>
          <Badge variant="outline">Document QA</Badge>
          <Badge variant="default">Default Subtle</Badge>
          
          <Tooltip content="Verified source reference">
            <span className="text-xs text-brand underline cursor-pointer">
              Hover for Tooltip
            </span>
          </Tooltip>

          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
            Open Test Modal
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          6. Syntax Highlighted Code Block
        </h2>
        <CodeBlock
          language="typescript"
          code={`export async function streamGeminiChat(prompt: string): Promise<ReadableStream> {
  const response = await ai.models.generateContentStream({
    model: 'gemini-1.5-flash',
    contents: prompt,
  });
  return response.toReadableStream();
}`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          7. Chat Message Stream (Open Layout + ReactMarkdown)
        </h2>
        <div className="p-6 rounded-2xl bg-surface-1 border border-border-strong space-y-4">
          <UserMessage
            message={{
              id: 'test-user-msg',
              conversationId: 'ds-test',
              role: 'user',
              content: 'What makes Cognix different from standard chat playgrounds?',
              createdAt: Date.now(),
            }}
          />

          <AssistantMessage
            message={{
              id: 'test-asst-msg',
              conversationId: 'ds-test',
              role: 'assistant',
              content: `## Calm Intelligence & Grounded Context

Cognix is engineered for deep focus, research, and coding workflows:

1. **Strict Evidence Grounding**: Every web query and document assertion includes verifiable citations [1].
2. **Transparent Memory**: Long-term profile stores preferences without training third-party foundation models.
3. **Refined Typography**: Open layout without claustrophobic cards or artificial barriers.`,
              citations: [
                {
                  id: 'cit-test-1',
                  type: 'document',
                  title: 'Cognix Architectural Specification',
                  pageNumber: 2,
                  snippet: 'Evidence grounding ensures zero hallucinated web references.',
                },
              ],
              createdAt: Date.now(),
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight border-b border-border-subtle pb-2">
          8. Compact Floating Composer
        </h2>
        <ChatComposer
          input={composerInput}
          onInputChange={setComposerInput}
          onSendMessage={() => {
            alert(`Message submitted: "${composerInput}"`);
            setComposerInput('');
          }}
          isStreaming={false}
          onStopStreaming={() => {}}
          attachedDocs={[]}
          onRemoveDoc={() => {}}
          onOpenDocUpload={() => setModalOpen(true)}
          webSearchEnabled={searchToggle}
          onToggleWebSearch={() => setSearchToggle(!searchToggle)}
        />
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Design System Dialog"
        description="Verifies backdrop blur, smooth spring entrance, and accessibility."
      >
        <div className="space-y-4 text-sm text-foreground-secondary">
          <p>
            This dialog uses Framer Motion spring physics with accessible focus management and Escape key dismissal.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
