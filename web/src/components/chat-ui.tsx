'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useProject } from '@/hooks/use-project';
import { Project } from '@/types/project';
import { Message, useChat } from '@ai-sdk/react';
import { nanoid } from 'nanoid';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { CodeViewer } from '@/components/code-viewer';
import { Icons } from '@/components/icons';
import { PageCard } from '@/components/page-card';
import { SiteGenerationProgress } from '@/components/site-generation-progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface ChatMessageProps {
  message: Message;
  project: Project;
  className?: string;
}

const MemoizedPageCard = memo(PageCard);

function ChatMessage({ message, project: initialProject, className }: ChatMessageProps) {
  const { project, updateProject } = useProject(initialProject.id);
  const { user } = useAuth();
  const [showMessageCode, setShowMessageCode] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    if (message.role !== 'assistant' || processedRef.current) return;

    // Extract all code blocks from the message
    const codeBlockRegex = /```(?:pagen|tsx|jsx)?\n([\s\S]*?)```/g;
    let match;
    const codeBlocks: Array<{ path: string; content: string }> = [];

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      const content = match[1].trim();
      // Look for the path comment at the start of the code block
      const pathMatch = content.match(/\/\/\s*Path:\s*(.+\.tsx)/);

      if (pathMatch) {
        const path = pathMatch[1].trim();
        // Remove the path comment and any empty lines that follow it
        const cleanContent = content.replace(/\/\/\s*Path:\s*(.+\.tsx)(\r?\n)*/, '').trim();
        codeBlocks.push({ path, content: cleanContent });
      }
    }

    // Process each code block
    if (codeBlocks.length > 0 && project) {
      // Create a new pageTree with the updated files
      const updatedPageTree = [...(project.pageTree || [])];
      codeBlocks.forEach(block => {
        const fileNode = {
          id: nanoid(),
          path: block.path,
          file: {
            id: nanoid(),
            name: block.path.split('/').pop() || '',
            content: block.content,
            metadata: {
              title: block.path,
            },
          },
        };

        const existingIndex = updatedPageTree.findIndex(p => p.path === block.path);
        if (existingIndex !== -1) {
          updatedPageTree[existingIndex] = fileNode;
        } else {
          updatedPageTree.push(fileNode);
        }
      });

      // Update the project with the new pageTree
      updateProject(project.id, {
        pageTree: updatedPageTree,
      });
      processedRef.current = true;
    }
  }, [message.content, message.role, message.id, project, updateProject]);

  const renderCodeBlock = useCallback(
    ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const language = /language-(\w+)/.exec(className || '')?.[1];
      if (language === 'pagen' || language === 'tsx' || language === 'jsx') {
        return <PageCard>{children}</PageCard>;
      }
      return <code className={className}>{children}</code>;
    },
    []
  );

  const MemoizedMarkdown = memo(({ content }: { content: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: renderCodeBlock,
        ul: ({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
          <ul className={cn('list-disc pl-4 mb-0 space-y-2', className)} {...props}>
            {children}
          </ul>
        ),
        ol: ({ className, children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
          <ol className={cn('list-decimal pl-4 mb-0 space-y-2', className)} {...props}>
            {children}
          </ol>
        ),
        li: ({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
          <li className={cn('leading-relaxed', className)} {...props}>
            {children}
          </li>
        ),
        p: ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
          <p className={cn('leading-relaxed', className)} {...props}>
            {children}
          </p>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  ));

  MemoizedMarkdown.displayName = 'MemoizedMarkdown';

  return (
    <>
      <div className={cn('group relative flex items-start w-full', className)}>
        <div className="inline-flex flex-col items-start gap-1 rounded-lg text-sm font-medium w-full">
          <div className="flex items-center justify-between gap-2 w-full">
            <div
              className={cn(
                'rounded-full bg-muted',
                message.role === 'user'
                  ? 'bg-primary/40 text-primary-foreground'
                  : 'bg-primary/40 text-primary-foreground'
              )}
            >
              {message.role === 'user' ? (
                user?.user_metadata.avatar_url ? (
                  <Image
                    src={user?.user_metadata.avatar_url}
                    alt="avatar"
                    width={12}
                    height={12}
                    className="rounded-full h-5 w-5 shrink-0"
                  />
                ) : (
                  <Icons.user className="h-5 w-5 shrink-0" />
                )
              ) : (
                <Image
                  src="/images/logo.svg"
                  alt="avatar"
                  width={24}
                  height={24}
                  className="rounded-full h-5 w-5 shrink-0"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMessageCode(true)}
                className="w-6 h-6"
              >
                <Icons.code className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            className={cn(
              'flex-1 flex flex-col space-y-1 leading-normal rounded-lg min-w-0 w-full',
              message.role === 'user'
                ? 'border border-primary/20 bg-muted-foreground/5 text-primary/60 p-2 shadow-sm'
                : 'text-muted-foreground py-2'
            )}
          >
            <MemoizedMarkdown content={message.content} />
          </div>
        </div>
      </div>

      <CodeViewer
        open={showMessageCode}
        onOpenChange={setShowMessageCode}
        code={message.content}
        title="Message Content"
        language="markdown"
      />
    </>
  );
}

interface ChatUIProps {
  project: Project;
}

export function ChatUI({ project }: ChatUIProps) {
  const { updateProject, appendMessage, isUpdating } = useProject(project.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);
  const [generationFiles, setGenerationFiles] = useState<
    Array<{
      path: string;
      type: 'page' | 'layout';
      status: 'pending' | 'generating' | 'complete' | 'error';
    }>
  >([]);
  const [currentFile, setCurrentFile] = useState<string>();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: onSubmit,
    setInput,
    append,
    setMessages,
    stop,
    status,
  } = useChat({
    api: '/api/chat',
    id: project.id,
    initialMessages: project.isNew ? [] : project.chat.messages,
    body: {
      id: project.id,
      title: project.title,
      context: {
        path: currentFile,
        pageTree: project.pageTree,
      },
      model: project.chat.model,
    },
    onResponse: (response: Response) => {
      // Handle generation plan
      const text = response.headers.get('x-completion-text');
      if (text) {
        try {
          const plan = JSON.parse(text);
          if (plan.files) {
            const files = plan.files.map((f: any) => ({
              ...f,
              status: 'pending',
            }));
            setGenerationFiles(files);

            // Start with the first file
            if (files.length > 0) {
              handleGenerateNextFile(files[0]);
            }
          }
        } catch (e) {
          console.error('Failed to parse generation plan:', e);
        }
      }
    },
    onFinish: async (message: Message) => {
      // Check for incomplete generation marker and remove it
      if (message.content.includes('[INCOMPLETE_GENERATION')) {
        message.content = message.content
          .replace(/\[INCOMPLETE_GENERATION:remaining_pages=\d+\]/, '')
          .trim();

        // Immediately append the continuation message
        append({
          role: 'user',
          content: 'Please continue generating the remaining pages.',
        });
      }

      // Use appendMessage instead of updateProject
      await appendMessage(message);

      // Handle code extraction and file generation
      console.log('Starting code extraction from message:', {
        messageLength: message.content.length,
        hasMarkdown: message.content.includes('###'),
        messageId: message.id,
      });

      // Split the message content into sections based on markdown headers
      const sections = message.content.split(/#{3,}\s+/);
      console.log('Split into sections:', {
        numberOfSections: sections.length,
        sections: sections.map(s => s.slice(0, 50) + '...'), // First 50 chars of each section
      });

      for (const section of sections) {
        console.log('Processing section:', {
          sectionLength: section.length,
          hasCodeBlock: section.includes('```'),
          firstLine: section.split('\n')[0],
        });

        // Extract code blocks from each section
        const codeBlockRegex = /```(?:pagen|tsx|jsx)?\n([\s\S]*?)```/g;
        let match;

        while ((match = codeBlockRegex.exec(section)) !== null) {
          console.log('Found code block:', {
            matchLength: match[0].length,
            contentLength: match[1].length,
            content: match[1].slice(0, 100) + '...', // First 100 chars
          });

          const blockContent = match[1].trim();
          // Look for the path comment at the start of the code block
          const pathMatch = blockContent.match(/\/\/\s*Path:\s*(.+\.tsx)/);

          console.log('Path extraction:', {
            hasPathMatch: !!pathMatch,
            pathMatch: pathMatch ? pathMatch[1] : 'no path found',
            firstLines: blockContent.split('\n').slice(0, 3), // First 3 lines
          });

          if (pathMatch) {
            const path = pathMatch[1].trim();
            // Remove the path comment and any empty lines that follow it
            const content = blockContent.replace(/\/\/\s*Path:\s*(.+\.tsx)(\r?\n)*/, '').trim();

            console.log('Processing code block:', {
              path,
              contentLength: content.length,
              firstContentLines: content.split('\n').slice(0, 3),
            });

            // Update file status if it's the current file
            if (path === currentFile) {
              console.log('Updating file status for current file:', path);
              setGenerationFiles(files =>
                files.map(f => (f.path === path ? { ...f, status: 'complete' } : f))
              );
            }

            // Update pageTree
            handleUpdatePageTree({ path, content });

            // Log for debugging
            console.log('Extracted code block:', {
              path,
              contentLength: content.length,
              firstContentLines: content.split('\n').slice(0, 3),
            });
          }
        }
      }

      // Find and generate next file
      const nextFile = generationFiles.find(f => f.status === 'pending');
      console.log('Next file check:', {
        hasNextFile: !!nextFile,
        nextFile: nextFile ? nextFile.path : 'none',
        remainingFiles: generationFiles.filter(f => f.status === 'pending').length,
      });

      if (nextFile) {
        handleGenerateNextFile(nextFile);
      }
    },
  });

  // Handle initial message from home page
  useEffect(() => {
    if (project?.isNew && project.chat.messages.length > 0 && !initialMessageSentRef.current) {
      const initialMessage = project.chat.messages[project.chat.messages.length - 1];
      // Clear the message from persistence
      updateProject(project.id, {
        isNew: false,
        chat: {
          ...project.chat,
          messages: [],
        },
      });
      console.log('Initial message:', initialMessage);
      // Send the message to AI
      append(initialMessage);
      initialMessageSentRef.current = true;
    }
  }, [project, append, updateProject]);

  const handleGenerateNextFile = useCallback(
    (nextFile: { path: string; type: 'page' | 'layout' }) => {
      setCurrentFile(nextFile.path);
      setGenerationFiles(files =>
        files.map(f => (f.path === nextFile.path ? { ...f, status: 'generating' } : f))
      );
      append({
        role: 'user',
        content: `Generate the file: ${nextFile.path}`,
      });
    },
    [append]
  );

  const handleUpdatePageTree = useCallback(
    (newFile: { path: string; content: string }) => {
      if (!project) return;
      // Normalize the path to use app router convention
      const normalizedPath = newFile.path
        .replace(/^pages\//, 'app/')
        .replace(/index\.tsx$/, 'page.tsx');

      // Create the file node
      const fileNode = {
        id: nanoid(),
        path: normalizedPath,
        file: {
          id: nanoid(),
          name: normalizedPath.split('/').pop() || '',
          content: newFile.content,
          metadata: {
            title: normalizedPath,
          },
        },
      };

      // Get the current pageTree or initialize it
      const currentPageTree = project.pageTree || [];
      const existingFileIndex = currentPageTree.findIndex(f => f.path === normalizedPath);

      // Create a new pageTree array with the updated or new file
      const updatedPageTree =
        existingFileIndex !== -1
          ? currentPageTree.map((f, i) => (i === existingFileIndex ? fileNode : f))
          : [...currentPageTree, fileNode];

      // Update the project with the new pageTree
      updateProject(project.id, {
        pageTree: updatedPageTree,
      });

      // Log for debugging
      console.log('Updated pageTree:', {
        originalPath: newFile.path,
        normalizedPath,
        existingFileIndex,
        pageTreeLength: updatedPageTree.length,
      });
    },
    [project, updateProject]
  );

  // Scroll to bottom effect with debounce
  useEffect(() => {
    const element = messagesEndRef.current;
    if (!element) return;

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'streaming') {
      stop();
      return;
    }
    if (!input?.trim()) {
      return;
    }

    const messageId = nanoid();
    const currentInput = input;
    setInput('');

    const newMessage = {
      id: messageId,
      content: currentInput,
      role: 'user' as const,
      createdAt: new Date(),
    };

    // Append to local state first for immediate UI update
    append(newMessage);

    // Use appendMessage instead of updateProject
    await appendMessage(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && input?.trim()) {
        form.requestSubmit();
      }
    }
  };

  const renderMessages = () => {
    return (
      <>
        {messages.map((message, i) => (
          <ChatMessage key={`${message.id}-${i + 1}`} message={message} project={project} />
        ))}
      </>
    );
  };

  if (!project?.chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Icons.warning className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No chat found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-2 border-b h-10">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Icons.logo className="h-5 w-5" />
          </Link>
          <span>Pages</span>
          {status === 'streaming' && <Icons.spinner className="h-4 w-4 animate-spin" />}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await updateProject(project.id, {
                chat: {
                  ...project.chat,
                  messages: [],
                },
              });
              setMessages([]);
            }}
            disabled={isUpdating}
            className="hover:text-red-500 w-6 h-6"
          >
            {isUpdating ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.trash className="h-4 w-4 text-red-500" />
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 flex flex-col justify-start">
        <div className="flex flex-col p-2 pr-3 gap-2">
          {messages.length ? (
            <>
              {renderMessages()}
              {generationFiles.length > 0 && (
                <SiteGenerationProgress files={generationFiles} currentFile={currentFile} />
              )}
            </>
          ) : (
            <EmptyScreen
              onSendPrompt={prompt =>
                append({
                  id: nanoid(),
                  content: prompt,
                  role: 'user',
                  createdAt: new Date(),
                })
              }
            />
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-1">
        <div className="relative flex w-full border border-foreground/20 focus-within:border-foreground/50 rounded-lg overflow-hidden bg-background gap-2">
          <Textarea
            tabIndex={0}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message"
            spellCheck={false}
            className="w-full sm:text-sm resize-none overflow-hidden bg-background border-0 focus:ring-0 focus-visible:ring-0 focus:border-primary/20 focus-visible:border-primary/20 focus-visible:ring-offset-0"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-1 bottom-1 h-5 text-xs text-muted-foreground gap-1"
              >
                {project.chat.model || 'gpt-4o'}
                <Icons.chevronUp className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="text-xs">
              {['gpt-4o', 'claude-3.5-sonnet', 'deepseek-v3', 'deepseek-v3-volcengine'].map(
                model => (
                  <DropdownMenuItem
                    key={model}
                    onClick={() => {
                      updateProject(project.id, {
                        chat: {
                          ...project.chat,
                          model,
                        },
                      });
                    }}
                    className="text-xs"
                  >
                    {model}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="submit"
            size="sm"
            disabled={status === 'streaming' && input === ''}
            className={cn(
              'absolute right-1 bottom-1 rounded shrink-0 h-5 w-auto flex items-center gap-1 px-2 text-xs',
              status === 'streaming' && 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            {status === 'streaming' ? 'stop' : 'submit'}
            {status === 'streaming' ? (
              <Icons.square className="h-2 w-2" />
            ) : (
              <Icons.cornerDownLeft className="h-2 w-2" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmptyScreen({ onSendPrompt }: { onSendPrompt: (prompt: string) => void }) {
  const samplePrompts = [
    'Create a pricing page with three tiers',
    'Design a hero section with a call-to-action',
    'Create a login form with a modern design',
    'Build a multi-page site about a new product',
    'Create a operations platform for a marketing SaaS',
  ];

  return (
    <div className="w-full px-4">
      <div className="w-full mt-4 flex flex-col items-center space-y-2">
        <h2 className="font-medium">Try these prompts</h2>
        <div className="grid gap-2 w-full">
          {samplePrompts.map(prompt => (
            <Button
              key={prompt}
              variant="outline"
              className="h-auto w-full p-1 text-left text-muted-foreground truncate overflow-hidden"
              onClick={() => onSendPrompt(prompt)}
            >
              <span className="text-xs truncate w-full block">{prompt}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
