/**
 * Tiện ích sao chép văn bản vào Clipboard (Đặc biệt tối ưu cho Mobile Web & In-app Browser)
 */

/**
 * Làm sạch văn bản Markdown & HTML trước khi chép vào bộ nhớ tạm
 * Giúp người dùng dán vào Zalo, Messenger, Ghi chú hiển thị trực quan, sạch đẹp, không dính ký tự thô
 */
export function cleanTextForCopy(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Sao chép văn bản vào Clipboard hỗ trợ đa nền tảng
 * Tương thích tốt với: iOS Safari, Android Chrome, WebView Zalo/Facebook/Messenger, HTTP/HTTPS
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const content = cleanTextForCopy(text);
  if (!content) return false;

  // 1. Thử API hiện đại navigator.clipboard
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      // Bị chặn quyền hoặc môi trường bảo mật, chuyển sang fallback
    }
  }

  // 2. Fallback dùng textarea tạm (Đặc biệt hiệu quả cho iOS Safari và Android Webview)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Lỗi khi sao chép clipboard:', err);
    return false;
  }
}
