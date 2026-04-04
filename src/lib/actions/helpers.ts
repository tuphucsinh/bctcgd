import { PostgrestError } from '@supabase/supabase-js';

// Định dạng kết quả trả về chuẩn cho toàn bộ Actions
export type ActionResult<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Hàm xử lý và log lỗi đồng nhất
export function handleActionError(context: string, error: unknown): { success: false; error: string } {
  const err = error as Error | PostgrestError;
  const message = 'message' in err ? err.message : String(error);
  console.error(`[ACTION_ERROR] ${context}:`, error);
  return { success: false, error: message };
}

// Hàm phân giải owner để filter hoặc insert
export function getOwnerFilter(userId: string, returnArray = true): string | string[] {
  const normalizedId = (userId || 'all').toLowerCase();

  if (!returnArray) {
    const ownerMap: Record<string, string> = { 
      hieu: 'HIEU', 
      ly: 'LY'
    };
    return ownerMap[normalizedId] || 'HIEU';
  }
  
  const ownerMapArray: Record<string, string[]> = {
    hieu: ['HIEU'],
    ly: ['LY'],
    all: ['HIEU', 'LY'],
    gd: ['HIEU', 'LY'],
    joint: ['HIEU', 'LY']
  };
  return ownerMapArray[normalizedId] || ownerMapArray['all'];
}
