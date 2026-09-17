import { FarmerCloudRecord, SyncStatusState } from '../types';

const OFFLINE_QUEUE_KEY = 'telangana_rythu_offline_queue_v1';
const CLOUD_RECORDS_CACHE_KEY = 'telangana_rythu_cloud_records_v1';
const LAST_SYNC_KEY = 'telangana_rythu_last_sync_timestamp';

export class OfflineSyncManager {
  private static listeners: ((status: SyncStatusState) => void)[] = [];
  private static state: SyncStatusState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    lastSyncedAt: null,
    isSyncing: false,
  };

  public static init() {
    if (typeof window === 'undefined') return;

    this.state.isOnline = navigator.onLine;
    this.updatePendingCount();

    const storedLastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (storedLastSync) {
      this.state.lastSyncedAt = parseInt(storedLastSync, 10);
    }

    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.notify();
      this.triggerAutoSync();
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.notify();
    });

    // Attempt sync on initial boot if online and items pending
    if (this.state.isOnline && this.state.pendingCount > 0) {
      setTimeout(() => this.triggerAutoSync(), 1500);
    }
  }

  public static subscribe(listener: (status: SyncStatusState) => void) {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  private static updatePendingCount() {
    try {
      const queue = this.getQueue();
      this.state.pendingCount = queue.length;
    } catch {
      this.state.pendingCount = 0;
    }
  }

  public static getQueue(): FarmerCloudRecord[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static getCachedRecords(): FarmerCloudRecord[] {
    try {
      const raw = localStorage.getItem(CLOUD_RECORDS_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static setCachedRecords(records: FarmerCloudRecord[]) {
    try {
      localStorage.setItem(CLOUD_RECORDS_CACHE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to cache records in localStorage:', e);
    }
  }

  public static addRecord(record: Omit<FarmerCloudRecord, 'id' | 'timestamp' | 'status'>): FarmerCloudRecord {
    const newRecord: FarmerCloudRecord = {
      ...record,
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      status: this.state.isOnline ? 'synced' : 'pending',
      syncTimestamp: this.state.isOnline ? Date.now() : undefined,
    };

    // Update local cache
    const existing = this.getCachedRecords();
    this.setCachedRecords([newRecord, ...existing]);

    if (!this.state.isOnline) {
      // Save to offline queue
      const queue = this.getQueue();
      queue.push(newRecord);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      this.updatePendingCount();
      this.notify();
    } else {
      // Send directly to cloud endpoint
      this.syncSingleRecord(newRecord).catch((err) => {
        console.warn('Network request failed, pushing to offline queue:', err);
        const queue = this.getQueue();
        newRecord.status = 'pending';
        queue.push(newRecord);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        this.updatePendingCount();
        this.notify();
      });
    }

    return newRecord;
  }

  public static async triggerAutoSync(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.state.isSyncing) return { success: false, syncedCount: 0 };
    const queue = this.getQueue();
    if (queue.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    this.state.isSyncing = true;
    this.notify();

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: queue }),
      });

      if (!response.ok) {
        throw new Error('Sync endpoint returned HTTP ' + response.status);
      }

      const result = await response.json();
      const syncedRecords: FarmerCloudRecord[] = result.syncedRecords || [];

      // Clear queue
      localStorage.removeItem(OFFLINE_QUEUE_KEY);

      // Update cached records
      const cached = this.getCachedRecords();
      const updatedCache = cached.map((item) => {
        const matching = syncedRecords.find((s) => s.id === item.id);
        if (matching) {
          return { ...item, status: 'synced' as const, syncTimestamp: Date.now() };
        }
        return item;
      });

      this.setCachedRecords(updatedCache);

      const now = Date.now();
      localStorage.setItem(LAST_SYNC_KEY, now.toString());
      this.state.lastSyncedAt = now;
      this.state.pendingCount = 0;
      this.state.isSyncing = false;
      this.notify();

      return { success: true, syncedCount: queue.length };
    } catch (error) {
      console.warn('Offline sync failed, will retry when reconnected:', error);
      this.state.isSyncing = false;
      this.notify();
      return { success: false, syncedCount: 0 };
    }
  }

  private static async syncSingleRecord(record: FarmerCloudRecord): Promise<void> {
    const res = await fetch('/api/cloud-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      throw new Error('Failed to persist record to cloud');
    }
  }
}
