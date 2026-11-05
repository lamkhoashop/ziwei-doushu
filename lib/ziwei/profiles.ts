import type { BirthInfo } from './types';
import { STEMS_VI, BRANCHES_VI } from './vietnamese';
import { Solar, Lunar } from 'lunar-javascript';

export type RelationshipType =
  | 'self'
  | 'father'
  | 'mother'
  | 'spouse'
  | 'child'
  | 'sibling'
  | 'friend'
  | 'other';

export const RELATIONSHIP_META: Record<
  RelationshipType,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  self: {
    label: 'Bản Thân',
    icon: '👤',
    color: '#fef08a',
    bg: 'rgba(212, 168, 67, 0.2)',
    border: 'rgba(212, 168, 67, 0.5)',
  },
  father: {
    label: 'Bố / Cha',
    icon: '👨',
    color: '#93c5fd',
    bg: 'rgba(59, 130, 246, 0.2)',
    border: 'rgba(59, 130, 246, 0.5)',
  },
  mother: {
    label: 'Mẹ',
    icon: '👩',
    color: '#fca5a5',
    bg: 'rgba(239, 68, 68, 0.2)',
    border: 'rgba(239, 68, 68, 0.5)',
  },
  spouse: {
    label: 'Vợ / Chồng',
    icon: '💍',
    color: '#f472b6',
    bg: 'rgba(236, 72, 153, 0.2)',
    border: 'rgba(236, 72, 153, 0.5)',
  },
  child: {
    label: 'Con Cái',
    icon: '👶',
    color: '#86efac',
    bg: 'rgba(34, 197, 94, 0.2)',
    border: 'rgba(34, 197, 94, 0.5)',
  },
  sibling: {
    label: 'Anh Chị Em',
    icon: '🤝',
    color: '#c084fc',
    bg: 'rgba(168, 85, 247, 0.2)',
    border: 'rgba(168, 85, 247, 0.5)',
  },
  friend: {
    label: 'Bạn Bè / Tri Kỷ',
    icon: '🍵',
    color: '#fdba74',
    bg: 'rgba(249, 115, 22, 0.2)',
    border: 'rgba(249, 115, 22, 0.5)',
  },
  other: {
    label: 'Khác',
    icon: '📜',
    color: '#d1d5db',
    bg: 'rgba(156, 163, 175, 0.2)',
    border: 'rgba(156, 163, 175, 0.5)',
  },
};

export interface SavedProfile {
  id: string;
  name: string;
  relationship: RelationshipType;
  birthInfo: BirthInfo;
  notes?: string;
  savedAt: number;
}

const STORAGE_KEY = 'ziwei_profile_book';

/** Đọc danh sách hồ sơ từ localStorage */
export function getSavedProfiles(): SavedProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      return list;
    }
    return [];
  } catch {
    return [];
  }
}

/** Lưu một hồ sơ mới hoặc cập nhật hồ sơ cũ */
export function saveProfile(profile: Omit<SavedProfile, 'id' | 'savedAt'> & { id?: string }): SavedProfile {
  const list = getSavedProfiles();
  const id = profile.id || `profile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();

  const newProfile: SavedProfile = {
    ...profile,
    id,
    savedAt: now,
  };

  const existingIdx = list.findIndex(p => p.id === id);
  if (existingIdx >= 0) {
    list[existingIdx] = newProfile;
  } else {
    list.unshift(newProfile);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Không thể lưu vào localStorage', e);
  }

  return newProfile;
}

/** Xóa một hồ sơ khỏi danh bạ */
export function deleteProfile(id: string): boolean {
  const list = getSavedProfiles();
  const filtered = list.filter(p => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/** Lấy thông tin Âm lịch hiển thị nhanh cho thẻ hồ sơ */
export function getProfileLunarText(birthInfo: BirthInfo): string {
  try {
    const solar = Solar.fromYmd(birthInfo.year, birthInfo.month, birthInfo.day);
    const lunar = solar.getLunar();
    const stemName = STEMS_VI[((lunar.getYear() - 4) % 10 + 10) % 10] || '';
    const branchName = BRANCHES_VI[((lunar.getYear() - 4) % 12 + 12) % 12] || '';
    return `${lunar.getDay()}/${lunar.getMonth()}/${lunar.getYear()} (${stemName} ${branchName})`;
  } catch {
    return `${birthInfo.day}/${birthInfo.month}/${birthInfo.year}`;
  }
}

/** Xuất toàn bộ danh bạ ra chuỗi JSON để sao lưu */
export function exportProfilesJSON(): string {
  const list = getSavedProfiles();
  return JSON.stringify({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    total: list.length,
    profiles: list,
  }, null, 2);
}

/** Nhập danh bạ từ chuỗi JSON sao lưu */
export function importProfilesJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const profiles = Array.isArray(data) ? data : data.profiles;
    if (!Array.isArray(profiles)) {
      return { success: false, count: 0, error: 'Định dạng dữ liệu không hợp lệ.' };
    }

    const currentList = getSavedProfiles();
    const currentIds = new Set(currentList.map(p => p.id));
    let addedCount = 0;

    profiles.forEach((item: any) => {
      if (item && item.birthInfo && item.birthInfo.year && item.birthInfo.month && item.birthInfo.day !== undefined) {
        const id = item.id || `profile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        if (!currentIds.has(id)) {
          currentList.push({
            id,
            name: item.name || item.birthInfo.name || 'Bản Mệnh',
            relationship: item.relationship || 'other',
            birthInfo: item.birthInfo,
            notes: item.notes || '',
            savedAt: item.savedAt || Date.now(),
          });
          currentIds.add(id);
          addedCount++;
        }
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
    return { success: true, count: addedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Lỗi khi đọc file sao lưu.' };
  }
}
