import { useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

const CLIPBOARD_TTL = 10000; // 10 seconds

/**
 * Secure clipboard hook with auto-wipe functionality
 * Copies text to clipboard and automatically clears it after TTL
 */
export function useSecureClipboard() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copiedTextRef = useRef<string | null>(null);

  const clearClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('');
      copiedTextRef.current = null;
    } catch (error) {
      console.error('Failed to clear clipboard:', error);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string = 'Text') => {
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(text);
      copiedTextRef.current = text;

      // Show success toast
      toast({
        title: 'Copied to clipboard',
        description: `${label} will be cleared in 10 seconds`,
        duration: 4000,
      });

      // Set timeout to clear clipboard
      timeoutRef.current = setTimeout(async () => {
        await clearClipboard();
        toast({
          title: 'Clipboard cleared',
          description: 'Sensitive data has been removed from clipboard',
          variant: 'default',
          duration: 3000,
        });
      }, CLIPBOARD_TTL);

      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
        duration: 4000,
      });
      return false;
    }
  }, [clearClipboard]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    clearClipboard();
  }, [clearClipboard]);

  return {
    copyToClipboard,
    cleanup,
  };
}
