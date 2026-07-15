import { GlossaryTerm } from "../types";

const DB_NAME = "AzarestanOfflineGlossary";
const STORE_NAME = "terms";
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("مرورگر شما از پایگاه داده IndexedDB پشتیبانی نمی‌کند."));
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        reject(new Error("خطا در باز کردن پایگاه داده آفلاین"));
      };

      request.onsuccess = (event) => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("category", "category", { unique: false });
          store.createIndex("project", "project", { unique: false });
          store.createIndex("term", "term", { unique: false });
        }
      };
    } catch (err: any) {
      reject(new Error("پایگاه داده IndexedDB در این مرورگر مسدود یا غیرفعال است: " + err.message));
    }
  });
}

export async function saveTerms(terms: GlossaryTerm[]): Promise<void> {
  return saveTermsWithProgress(terms, () => {});
}

export async function saveTermsWithProgress(
  terms: GlossaryTerm[], 
  onProgress: (progress: number) => void
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    let completed = 0;
    const total = terms.length;

    if (total === 0) {
      onProgress(100);
      resolve();
      return;
    }

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(new Error("خطا در ذخیره‌سازی واژه‌ها در حافظه آفلاین"));
    };

    terms.forEach((term) => {
      const request = store.put(term);
      request.onsuccess = () => {
        completed++;
        onProgress(Math.round((completed / total) * 100));
      };
      request.onerror = () => {
        // continue
      };
    });
  });
}

export async function clearTerms(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error("خطا در پاکسازی حافظه آفلاین"));
    };
  });
}

export async function getAllTerms(): Promise<GlossaryTerm[]> {
  return getAllTermsWithProgress(() => {});
}

export async function getAllTermsWithProgress(
  onProgress: (progress: number) => void
): Promise<GlossaryTerm[]> {
  const db = await initDB();
  const count = await getTermsCount();
  return new Promise((resolve, reject) => {
    if (count === 0) {
      onProgress(100);
      resolve([]);
      return;
    }

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const results: GlossaryTerm[] = [];
    const request = store.openCursor();
    let fetched = 0;

    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        fetched++;
        onProgress(Math.min(100, Math.round((fetched / count) * 100)));
        cursor.continue();
      } else {
        onProgress(100);
        resolve(results);
      }
    };

    request.onerror = () => {
      reject(new Error("خطا در بازیابی واژه‌های آفلاین"));
    };
  });
}

export async function getTermsCount(): Promise<number> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result || 0);
    };

    request.onerror = () => {
      reject(new Error("خطا در شمارش واژه‌های آفلاین"));
    };
  });
}

export async function deleteTerm(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error("خطا در حذف واژه آفلاین"));
    };
  });
}
