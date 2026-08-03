export interface OfflineData {
  id: string
  type: "donation" | "volunteer"
  data: unknown
  createdAt: number
}

class OfflineStorage {
  private dbName = "vitamend-offline"
  private dbVersion = 1
  private storeName = "pending-submissions"

  async openDatabase(): Promise<IDBDatabase | null> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" })
        }
      }
    })
  }

  async saveDonation(data: unknown): Promise<string> {
    const id = crypto.randomUUID()
    const offlineData: OfflineData = {
      id,
      type: "donation",
      data,
      createdAt: Date.now(),
    }

    const db = await this.openDatabase()
    if (!db) return id; // return fallback id if offline storage not available
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.add(offlineData)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        // Register for sync when online
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          navigator.serviceWorker.ready.then((registration) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (registration as any).sync.register("donation-sync").catch((err: unknown) => {
              console.error("Background sync registration failed:", err)
            })
          })
        }
        resolve(id)
      }

      transaction.oncomplete = () => db.close()
    })
  }

  async saveVolunteer(data: unknown): Promise<string> {
    const id = crypto.randomUUID()
    const offlineData: OfflineData = {
      id,
      type: "volunteer",
      data,
      createdAt: Date.now(),
    }

    const db = await this.openDatabase()
    if (!db) return id;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.add(offlineData)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        // Register for sync when online
        if ("serviceWorker" in navigator && "SyncManager" in window) {
          navigator.serviceWorker.ready.then((registration) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (registration as any).sync.register("volunteer-sync").catch((err: unknown) => {
              console.error("Background sync registration failed:", err)
            })
          })
        }
        resolve(id)
      }

      transaction.oncomplete = () => db.close()
    })
  }

  async getPendingSubmissions(): Promise<OfflineData[]> {
    const db = await this.openDatabase()
    if (!db) return [];
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      transaction.oncomplete = () => db.close()
    })
  }

  async removeSubmission(id: string): Promise<void> {
    const db = await this.openDatabase()
    if (!db) return;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()

      transaction.oncomplete = () => db.close()
    })
  }
}

export const offlineStorage = new OfflineStorage()
