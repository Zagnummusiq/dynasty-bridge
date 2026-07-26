import { openDB, IDBPDatabase } from 'idb';
import { Product } from '../context/CartContext';

const DB_NAME = 'dynasty-bridge-db';
const STORE_NAME = 'products';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function syncProductsToCache(products: Product[]) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  for (const product of products) {
    await store.put(product);
  }
  await tx.done;
}

export async function getCachedProducts(): Promise<Product[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
