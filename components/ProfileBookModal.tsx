'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BirthInfo } from '@/lib/ziwei/types';
import {
  SavedProfile,
  RelationshipType,
  RELATIONSHIP_META,
  getSavedProfiles,
  saveProfile,
  deleteProfile,
  getProfileLunarText,
  exportProfilesJSON,
  importProfilesJSON,
} from '@/lib/ziwei/profiles';
import { BRANCHES_VI } from '@/lib/ziwei/vietnamese';

interface ProfileBookModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProfile: (birthInfo: BirthInfo) => void;
  currentBirthInfo?: BirthInfo | null;
}

export default function ProfileBookModal({
  open,
  onClose,
  onSelectProfile,
  currentBirthInfo,
}: ProfileBookModalProps) {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRel, setSelectedRel] = useState<RelationshipType | 'all'>('all');
  const [editingProfile, setEditingProfile] = useState<SavedProfile | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Nạp danh sách từ localStorage
  const refreshProfiles = () => {
    setProfiles(getSavedProfiles());
  };

  useEffect(() => {
    if (open) {
      refreshProfiles();
      setIsAddingNew(false);
      setEditingProfile(null);
      setImportStatus(null);
    }
  }, [open]);

  // Kiểm tra xem lá số hiện tại đã có trong danh bạ chưa
  const currentAlreadySaved = currentBirthInfo && profiles.some(
    p => p.birthInfo.year === currentBirthInfo.year &&
         p.birthInfo.month === currentBirthInfo.month &&
         p.birthInfo.day === currentBirthInfo.day &&
         p.birthInfo.hour === currentBirthInfo.hour &&
         p.name === (currentBirthInfo.name || 'Bản Mệnh')
  );

  // Lưu nhanh lá số hiện tại vào danh bạ
  const handleSaveCurrent = (rel: RelationshipType = 'self') => {
    if (!currentBirthInfo) return;
    saveProfile({
      name: currentBirthInfo.name || 'Bản Mệnh',
      relationship: rel,
      birthInfo: currentBirthInfo,
    });
    refreshProfiles();
  };

  // Xóa hồ sơ
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa hồ sơ của "${name}" khỏi Sổ Tay Bản Mệnh?`)) {
      deleteProfile(id);
      refreshProfiles();
    }
  };

  // Xuất file sao lưu JSON
  const handleExport = () => {
    const jsonStr = exportProfilesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `So_Tay_Ban_Menh_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Nhập file sao lưu JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importProfilesJSON(content);
        if (result.success) {
          setImportStatus(`✓ Đã nhập thành công ${result.count} hồ sơ mới.`);
          refreshProfiles();
        } else {
          setImportStatus(`⚠️ Lỗi: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Lọc danh sách hồ sơ
  const filteredProfiles = profiles.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
    const matchRel = selectedRel === 'all' || p.relationship === selectedRel;
    return matchSearch && matchRel;
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5"
          style={{ background: 'rgba(2, 6, 12, 0.88)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl overflow-hidden border border-amber-500/40 flex flex-col w-full max-w-[820px] max-h-[90vh]"
            style={{
              background: 'linear-gradient(145deg, #0e121b 0%, #080a10 60%, #140f08 100%)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.9), 0 0 35px rgba(212,168,67,0.18)',
            }}
          >
            {/* Header Modal */}
            <div className="px-5 py-3.5 border-b border-amber-500/25 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📖</span>
                <div>
                  <div className="text-sm font-bold text-amber-300 font-mystic tracking-wider uppercase flex items-center gap-2">
                    <span>SỔ TAY BẢN MỆNH</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-200 font-sans font-semibold">
                      {profiles.length} hồ sơ
                    </span>
                  </div>
                  <div className="text-[10.5px] text-amber-200/80 flex items-center gap-1.5 flex-wrap">
                    <span>Danh bạ gia đình & người thân</span>
                    <span className="text-amber-500/50">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-300 font-sans font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px]">
                      <span>🔒</span> Lưu trên máy bạn · Không lưu máy chủ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  title="Xuất file sao lưu JSON"
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-amber-500/30 bg-white/5 hover:bg-white/10 text-amber-200 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>💾</span>
                  <span className="hidden sm:inline">Sao Lưu</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Nhập file sao lưu JSON"
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-amber-500/30 bg-white/5 hover:bg-white/10 text-amber-200 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>📥</span>
                  <span className="hidden sm:inline">Nhập File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-amber-500/30 bg-white/5 text-amber-200/80 hover:text-amber-100 hover:bg-white/10 text-base cursor-pointer transition-all ml-1"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Thông báo nhập file nếu có */}
            {importStatus && (
              <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <span>{importStatus}</span>
                <button
                  type="button"
                  onClick={() => setImportStatus(null)}
                  className="text-amber-400 hover:text-amber-100 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Banner gợi ý lưu lá số đang xem */}
            {currentBirthInfo && !currentAlreadySaved && (
              <div className="mx-5 mt-4 p-3 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-amber-950/20 to-transparent flex items-center justify-between gap-3 text-xs flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-base text-emerald-400">🛡️</span>
                  <span className="text-amber-100">
                    Lá số của <strong>{currentBirthInfo.name || 'Bản Mệnh'}</strong> sẽ được <strong>lưu trực tiếp trong máy của bạn</strong> (hoàn toàn riêng tư, tuyệt đối không gửi lên máy chủ hay bên thứ ba).
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveCurrent('self')}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-500/50 cursor-pointer transition-all"
                  >
                    + Lưu Làm Bản Thân
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProfile({
                        id: '',
                        name: currentBirthInfo.name || 'Người thân',
                        relationship: 'spouse',
                        birthInfo: currentBirthInfo,
                        savedAt: Date.now(),
                      });
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/5 hover:bg-white/10 text-amber-100 border border-white/15 cursor-pointer transition-all"
                  >
                    Tùy chọn khác...
                  </button>
                </div>
              </div>
            )}

            {/* Thanh tìm kiếm & Bộ lọc quan hệ */}
            <div className="px-5 pt-3 pb-2 flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-400/60">🔍</span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm theo tên người thân hoặc ghi chú..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-amber-500/30 bg-black/40 text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400 transition-all"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400/60 hover:text-amber-200 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Tab lọc quan hệ */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRel('all')}
                  className={`px-3 py-1 rounded-full text-[11px] font-mystic whitespace-nowrap border transition-all cursor-pointer ${
                    selectedRel === 'all'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                      : 'border-white/10 bg-white/5 text-amber-100/60 hover:text-amber-200'
                  }`}
                >
                  Tất cả ({profiles.length})
                </button>
                {(Object.keys(RELATIONSHIP_META) as RelationshipType[]).map(relKey => {
                  const meta = RELATIONSHIP_META[relKey];
                  const count = profiles.filter(p => p.relationship === relKey).length;
                  if (count === 0 && selectedRel !== relKey) return null;

                  return (
                    <button
                      key={relKey}
                      type="button"
                      onClick={() => setSelectedRel(relKey)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mystic whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1 ${
                        selectedRel === relKey
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                          : 'border-white/10 bg-white/5 text-amber-100/60 hover:text-amber-200'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                      {count > 0 && <span className="text-[9.5px] opacity-75">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Danh sách Hồ Sơ */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 min-h-[220px]">
              {filteredProfiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 text-amber-200/60">
                  <span className="text-4xl mb-3 opacity-60">📜</span>
                  <div className="font-mystic font-bold text-sm text-amber-300 mb-1">
                    {search ? 'Không tìm thấy hồ sơ phù hợp' : 'Chưa có hồ sơ nào trong Sổ Tay'}
                  </div>
                  <div className="text-xs max-w-sm mb-4 leading-relaxed">
                    {search
                      ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
                      : 'Lưu lá số của Bố Mẹ, Vợ/Chồng, Con cái vào đây để xem lại bất cứ lúc nào chỉ với 1 cú nhấp chuột.'}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredProfiles.map(p => {
                    const meta = RELATIONSHIP_META[p.relationship] || RELATIONSHIP_META.other;
                    const lunarText = getProfileLunarText(p.birthInfo);
                    const genderStr = p.birthInfo.gender === 'male' ? 'Nam' : 'Nữ';
                    const hourBranch = BRANCHES_VI[p.birthInfo.hour] || 'Tý';

                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl border transition-all hover:border-amber-500/60 hover:shadow-[0_4px_20px_rgba(212,168,67,0.12)] flex flex-col justify-between group"
                        style={{
                          background: 'linear-gradient(145deg, rgba(20,25,38,0.85) 0%, rgba(12,14,22,0.92) 100%)',
                          borderColor: 'rgba(212, 168, 67, 0.22)',
                        }}
                      >
                        <div>
                          {/* Dòng tiêu đề thẻ: Tên + Badge quan hệ + Thao tác */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
                                style={{
                                  background: meta.bg,
                                  borderColor: meta.border,
                                  color: meta.color,
                                }}
                              >
                                <span>{meta.icon}</span>
                                <span>{meta.label}</span>
                              </span>
                              <span className="font-bold font-mystic text-sm text-amber-200 tracking-wide">
                                {p.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setEditingProfile(p)}
                                title="Chỉnh sửa thông tin"
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-amber-300 text-xs cursor-pointer"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id, p.name)}
                                title="Xóa khỏi sổ tay"
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-rose-500/20 text-rose-400 text-xs cursor-pointer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Thông tin ngày giờ sinh Dương & Âm */}
                          <div className="space-y-1 text-[11px] text-amber-100/70 font-mystic mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-400/80">☀️</span>
                              <span>Dương: {p.birthInfo.day}/{p.birthInfo.month}/{p.birthInfo.year} ({genderStr} · Giờ {hourBranch})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-400/80">🌙</span>
                              <span className="text-amber-300/80">Âm: {lunarText}</span>
                            </div>
                            {p.birthInfo.city && (
                              <div className="flex items-center gap-1.5 text-[10.5px] opacity-75">
                                <span>📍</span>
                                <span>{p.birthInfo.city}</span>
                              </div>
                            )}
                            {p.notes && (
                              <div className="text-[10px] italic text-amber-300/60 pt-0.5 border-t border-white/5 mt-1">
                                💬 &ldquo;{p.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Nút Xem Lá Số Ngay */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProfile(p.birthInfo);
                            onClose();
                          }}
                          className="w-full py-1.5 px-3 rounded-lg text-xs font-bold font-mystic tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm border border-amber-400/40 text-amber-950 hover:scale-[1.01] active:scale-[0.99]"
                          style={{
                            background: 'linear-gradient(135deg, #f5d77f 0%, #d4a843 60%, #b38321 100%)',
                          }}
                        >
                          <span>Xem Lá Số Ngay</span>
                          <span>→</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Modal: Cam kết bảo mật & Quyền riêng tư */}
            <div className="px-5 py-2.5 border-t border-amber-500/20 bg-emerald-950/20 flex items-center justify-between text-xs flex-shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-300 text-[11px]">
                <span className="text-sm">🛡️</span>
                <span>
                  <strong>Cam kết bảo mật:</strong> Dữ liệu lưu 100% trong bộ nhớ máy của bạn (Local Storage). Không lưu trên máy chủ, không gửi đi bất kỳ đâu.
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1 rounded-lg border border-white/15 hover:bg-white/10 text-amber-200 text-xs cursor-pointer transition-all"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Chỉnh Sửa Hồ Sơ */}
      {editingProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setEditingProfile(null)}
        >
          <div
            className="w-full max-w-md rounded-xl p-5 border border-amber-500/40 space-y-4"
            style={{ background: '#0e121b', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <h3 className="font-mystic font-bold text-amber-300 text-sm">
                Chỉnh Sửa Hồ Sơ: {editingProfile.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="text-amber-400 hover:text-white text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-200/80 mb-1">Tên gọi / Biệt danh:</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={e => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-amber-500/30 bg-black/60 text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-amber-200/80 mb-1">Mối quan hệ gia đình:</label>
                <select
                  value={editingProfile.relationship}
                  onChange={e => setEditingProfile({ ...editingProfile, relationship: e.target.value as RelationshipType })}
                  className="w-full p-2 rounded-lg border border-amber-500/30 bg-black/60 text-amber-100 focus:outline-none focus:border-amber-400"
                >
                  {(Object.keys(RELATIONSHIP_META) as RelationshipType[]).map(r => (
                    <option key={r} value={r}>
                      {RELATIONSHIP_META[r].icon} {RELATIONSHIP_META[r].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-amber-200/80 mb-1">Ghi chú riêng:</label>
                <textarea
                  value={editingProfile.notes || ''}
                  onChange={e => setEditingProfile({ ...editingProfile, notes: e.target.value })}
                  placeholder="Ví dụ: Giờ sinh do bà ngoại nhớ, con thứ hai..."
                  rows={2}
                  className="w-full p-2 rounded-lg border border-amber-500/30 bg-black/60 text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  saveProfile(editingProfile);
                  setEditingProfile(null);
                  refreshProfiles();
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400/50 text-amber-200 font-bold text-xs cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
