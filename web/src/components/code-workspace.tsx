"use client";

import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { usePageStore } from "@/store/page";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagePreview } from "@/components/page-preview"; 
import { Icons } from "./ui/icons";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeWorkspaceProps {
  id: string;
  isMobile: boolean;
  setIsPreviewOpen?: (open: boolean) => void;
}

export function CodeWorkspace({
  id,
  isMobile,
}: CodeWorkspaceProps) {
  const { pages, activePage } = usePageStore();
  const activePageData = activePage ? pages[activePage] : null;
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  const handleScreenshot = useCallback(async () => {
    if (!activePage) return;

    try {
      setIsScreenshotting(true);
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activePage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to capture screenshot');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `screenshot-${activePage}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Screenshot error:', error);
    } finally {
      setIsScreenshotting(false);
    }
  }, [activePage]);

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="code" className="flex-1 h-full flex flex-col">
        <div className="flex items-center justify-between border-b">
          <TabsList className="bg-transparent">
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Icons.terminal className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Icons.window className="h-4 w-4" />
              Preview
            </TabsTrigger>
            {activePageData && (
            <div className="flex items-center gap-2 p-2">
              {activePageData.status === "generating" && (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              )}
              {activePageData.status === "complete" && (
                <Icons.checkCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
          </TabsList>
          {activePageData && (
            <div className="flex items-center gap-2 p-2">
              <Button
                variant="ghost"
                onClick={handleScreenshot}
                disabled={!activePageData || activePageData.status !== "complete" || isScreenshotting}
                className="flex items-center h-6 w-6"
              >
                {isScreenshotting ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <Icons.camera className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1 h-[calc(100%-4rem)] overflow-hidden">
          <TabsContent value="code" className="h-full m-0 bg-muted/20">
            {activePageData ? (
              <ScrollArea className="h-full">
                  <CodeBlock
                    code={activePageData.content || ""}
                    language="tsx"
                  />
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No page selected
              </div>
            )}
          </TabsContent>
          <TabsContent value="preview" className="h-full m-0">
            {activePageData && <PagePreview messageId={activePageData.messageId} />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
