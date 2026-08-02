import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { Product } from '../context/CartContext';

const DB_NAME = 'dynasty-bridge-db';
const STORE_NAME = 'products';
const DB_VERSION = 2; // bumped to add subcategory index

let _db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      }
      if (oldVersion < 2) {
        // Version 2: ensure store exists (migration from v1)
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      }
    },
    blocked() {
      console.warn('DB upgrade blocked — another tab may be open');
    },
    blocking() {
      _db?.close();
      _db = null;
    },
    terminated() {
      _db = null;
    },
  });
  return _db;
}

export async function syncProductsToCache(products: Product[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await Promise.all(products.map(p => store.put(p)));
    await tx.done;
  } catch (err) {
    console.error('Cache write error:', err);
  }
}

export async function getCachedProducts(): Promise<Product[]> {
  try {
    const db = await getDB();
    const items = await db.getAll(STORE_NAME);
    return items as Product[];
  } catch (err) {
    console.error('Cache read error:', err);
    return [];
  }
}

export async function clearProductCache(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch (err) {
    console.error('Cache clear error:', err);
  }
}
