import {
  AlertCircle,
  AppWindow,
  AppWindowMac,
  Bookmark,
  Bot,
  Camera,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  Code,
  CodeXml,
  Copy,
  Folder,
  Laptop,
  Link,
  ListTodo,
  Loader2,
  LogOut,
  MessageSquareDiff,
  Monitor,
  Moon,
  Plug2,
  Plus,
  Send,
  SendHorizonal,
  Settings,
  Settings2,
  Sparkles,
  Square,
  Sun,
  SunMoon,
  Terminal,
  Trash,
  User,
  UserRound,
  Wand,
  Webhook,
  X,
} from 'lucide-react';

function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#4F46E5" />

      <path d="M11 8h8c2.2091 0 4 1.7909 4 4 0 2.2091-1.7909 4-4 4h-4v8h-4V8z" fill="white" />

      <path d="M15 12h3.5c1.1046 0 2 .8954 2 2s-.8954 2-2 2H15v-4z" fill="#4F46E5" />

      <rect x="19" y="18" width="6" height="2" rx="1" fill="white" opacity="0.8" />
      <rect x="19" y="22" width="4" height="2" rx="1" fill="white" opacity="0.6" />
    </svg>
  );
}

export function Google({ ...props }: any) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}

export function Github({ ...props }: any) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
      />
    </svg>
  );
}

export const Icons = {
  logo: Logo,
  check: Check,
  checkCircle: CheckCircle2,
  chevronLeft: ChevronLeft,
  close: X,
  link: Link,
  plus: Plus,
  listTodo: ListTodo,
  spinner: Loader2,
  figma: Square, // Using Square as a placeholder for Figma icon
  send: SendHorizonal,
  sparkles: Sparkles,
  bot: Bot,
  square: Square,
  terminal: Terminal,
  trash: Trash,
  wand: Wand,
  window: AppWindowMac,
  code: CodeXml,
  camera: Camera,
  api: Plug2,
  copy: Copy,
  user: UserRound,
  warning: AlertCircle,
  settings: Settings,
  settings2: Settings2,
  logout: LogOut,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  theme: SunMoon,
  project: MessageSquareDiff,
  add: Plus,
  // Logos
  google: Google,
  github: Github,
};
