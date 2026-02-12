/**
 * Utility functions for Web Share API with clipboard fallback
 */

export interface ShareOptions {
  title?: string;
  text: string;
}

/**
 * Share content using Web Share API if available, otherwise copy to clipboard
 * @param options Share options (title and text)
 * @param onSuccess Callback for successful clipboard copy (not called for Web Share)
 * @param onError Callback for errors
 */
export async function shareContent(
  options: ShareOptions,
  onSuccess?: () => void,
  onError?: () => void
): Promise<void> {
  const { title, text } = options;

  // Try Web Share API first (mobile devices)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      // Don't call onSuccess for Web Share - user sees native UI
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        onError?.();
      }
    }
  } else {
    // Fallback to clipboard copy (desktop)
    try {
      await navigator.clipboard.writeText(text);
      onSuccess?.();
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      onError?.();
    }
  }
}
