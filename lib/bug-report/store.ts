import fs from 'fs';
import path from 'path';

export interface BugMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time: number;
}

export interface TicketData {
  userName: string;
  lastUpdated: number;
  messages: BugMessage[];
}

export interface BugStoreData {
  lastSessionId: string | null;
  tickets: Record<string, TicketData>;
}

const STORE_FILE = process.platform === 'win32'
  ? path.join(process.cwd(), '.bug_store.json')
  : '/tmp/ziwei_bug_store.json';

// In-memory cache
let memStore: BugStoreData = {
  lastSessionId: null,
  tickets: {},
};

function loadStore(): BugStoreData {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memStore = {
          lastSessionId: parsed.lastSessionId || null,
          tickets: parsed.tickets || {},
        };
        return memStore;
      }
    }
  } catch (err) {
    console.error('Error reading bug store file:', err);
  }
  return memStore;
}

function persistStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(memStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving bug store file:', err);
  }
}

// Khởi tạo load từ disk một lần ban đầu
loadStore();

export function addUserMessage(sessionId: string, userName: string, text: string): void {
  loadStore();

  if (!memStore.tickets[sessionId]) {
    memStore.tickets[sessionId] = {
      userName: userName || `Khách (#${sessionId.slice(0, 4)})`,
      lastUpdated: Date.now(),
      messages: [],
    };
  }

  memStore.lastSessionId = sessionId;
  memStore.tickets[sessionId].userName = userName || memStore.tickets[sessionId].userName;
  memStore.tickets[sessionId].lastUpdated = Date.now();
  memStore.tickets[sessionId].messages.push({
    id: `${Date.now()}-user`,
    sender: 'user',
    text,
    time: Date.now(),
  });

  persistStore();
}

export function addAdminMessage(
  preferredSessionId: string | null,
  text: string
): { success: boolean; targetSessionId: string | null; userName: string } {
  loadStore();

  // 1. Ưu tiên sessionId nếu được truyền vào chính xác
  let targetId = preferredSessionId && memStore.tickets[preferredSessionId] ? preferredSessionId : null;

  // 2. Nếu không tìm thấy, fallback về session vừa gửi lỗi gần đây nhất
  if (!targetId) {
    if (memStore.lastSessionId && memStore.tickets[memStore.lastSessionId]) {
      targetId = memStore.lastSessionId;
    } else {
      // Tìm session có lastUpdated mới nhất
      const allIds = Object.keys(memStore.tickets);
      if (allIds.length > 0) {
        allIds.sort((a, b) => memStore.tickets[b].lastUpdated - memStore.tickets[a].lastUpdated);
        targetId = allIds[0];
      }
    }
  }

  if (!targetId || !memStore.tickets[targetId]) {
    return { success: false, targetSessionId: null, userName: '' };
  }

  const ticket = memStore.tickets[targetId];
  ticket.messages.push({
    id: `${Date.now()}-admin`,
    sender: 'admin',
    text,
    time: Date.now(),
  });
  ticket.lastUpdated = Date.now();

  persistStore();

  return {
    success: true,
    targetSessionId: targetId,
    userName: ticket.userName,
  };
}

export function getMessages(sessionId: string): BugMessage[] {
  loadStore();
  return memStore.tickets[sessionId]?.messages || [];
}
