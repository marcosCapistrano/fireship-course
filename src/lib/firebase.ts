// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { writable, type Readable, derived } from "svelte/store";
    import { doc, onSnapshot } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAapAr6lvqkyGIQkhMMMZ47-vpBi3blaL4",
    authDomain: "fireship-course-45f1e.firebaseapp.com",
    projectId: "fireship-course-45f1e",
    storageBucket: "fireship-course-45f1e.appspot.com",
    messagingSenderId: "31556359916",
    appId: "1:31556359916:web:e64f0d942f0fa4159af7c9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

function userStore() {
    let unsubscribe: () => void;

    if (!auth || !globalThis.window) {
        console.warn("Auth is not initialized or not in browser");
        const { subscribe } = writable<UserData | null>(null);
        return {
            subscribe,
        }
    }

    const { subscribe } = writable(auth?.currentUser, (set) => {
        onAuthStateChanged(auth, (user) => {
            set(user);
        })

        return () => unsubscribe();
    })

    return {
        subscribe
    }
}

export const user = userStore();

/**
 * @param  {string} path document path or reference
 * @returns a store with realtime updates on document data
 */
export function docStore<T>(
    path: string,
) {
    let unsubscribe: () => void;

    const docRef = doc(db, path);

    const { subscribe } = writable<T | null>(null, (set) => {
        unsubscribe = onSnapshot(docRef, (snapshot) => {
            set((snapshot.data() as T) ?? null);
        });

        return () => unsubscribe();
    });

    return {
        subscribe,
        ref: docRef,
        id: docRef.id,
    };
}

interface UserData {
  username: string;
  bio: string;
  photoURL: string;
  links: any[];
  uid: string;
}

export const userData: Readable<UserData | null> = derived(user, ($user, set) => { 
  if ($user) {
    return docStore<UserData>(`users/${$user.uid}`).subscribe(set);
  } else {
    set(null); 
  }
});