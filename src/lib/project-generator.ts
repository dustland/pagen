import { type FileContent } from '@/types/project'

export function generateNextProject(content: string): FileContent[] {
  return [
    {
      path: 'package.json',
      content: JSON.stringify({
        name: "next-runtime-example",
        version: "1.0.0",
        private: true,
        scripts: {
          "dev": "next dev",
          "build": "next build",
          "start": "next start"
        },
        dependencies: {
          "next": "13.5.6",
          "react": "18.2.0",
          "react-dom": "18.2.0"
        }
      }, null, 2)
    },
    {
      path: 'app/page.tsx',
      content: content
    },
    {
      path: 'app/layout.tsx',
      content: `
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Preview',
  description: 'Generated by Pagen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
    },
    {
      path: 'app/globals.css',
      content: `
@tailwind base;
@tailwind components;
@tailwind utilities;`
    }
  ]
}
