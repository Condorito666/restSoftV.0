import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as categories from './src/assets/categories.json';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'your_firebase_api_key',
  authDomain: 'your_firebase_auth_domain',
  projectId: 'your_firebase_project_id',
  storageBucket: 'your_firebase_storage_bucket',
  messagingSenderId: 'your_firebase_messaging_sender_id',
  appId: 'your_firebase_app_id',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadCategories() {
  const categoriesCollection = collection(db, 'categories');

  for (const category of categories) {
    try {
      await addDoc(categoriesCollection, category);
      console.log(`Category ${category.title} added successfully`);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }
}

uploadCategories();
