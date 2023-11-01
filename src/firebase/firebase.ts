// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getDatabase,
  ref as databaseRef,
  get,
  set as databaseSet,
} from "firebase/database";
import { getMessaging } from "firebase/messaging";
import {
  getStorage,
  ref as storageRef,
  list as storageList,
  listAll,
  getDownloadURL,
  uploadBytes,
  FullMetadata,
} from "firebase/storage";
import { IVideoItem } from "../types/display";

export interface AdminUser extends User {
  isAdmin: boolean;
}

const {
  VITE_FIREBASE_APIKEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_DATABASE_URL,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
} = import.meta.env;

const firebaseConfig = {
  apiKey: VITE_FIREBASE_APIKEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: VITE_FIREBASE_DATABASE_URL,
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
  measurementId: VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const messaging = getMessaging(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();
export const emailLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return signInWithEmailAndPassword(auth, email, password);
};
export const googleLogin = async () =>
  signInWithPopup(auth, provider).catch((error) => {
    console.log(error);
    return null;
  });

export const logout = async () => {
  return signOut(auth);
};

export const onUserStateChanged = (
  callback: (user: AdminUser | null) => void,
  onError: (error: Error) => void
) =>
  onAuthStateChanged(
    auth,
    async (user: User | null) => {
      const updatedUser = user && (await addIsAdmin(user));
      callback(updatedUser);
    },
    onError
  );

// RealtimeDB

const addIsAdmin = async (user: User) => {
  return get(databaseRef(database, "admins")) //
    .then((snapshot) => {
      if (snapshot.exists()) {
        const admins: string[] = snapshot.val();
        const isAdmin = admins.includes(user.uid);
        return { ...user, isAdmin };
      } else {
        return { ...user, isAdmin: false };
      }
    });
};

const writeVideoData = (metadata: FullMetadata) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const reference = databaseRef(database, `videos/${user.uid}`);
      databaseSet(reference, {
        fileName: metadata,
      });
    } else {
      // User is signed out
      // ...
    }
  });
};

// Storage

export const getVideoList = async () => {
  return new Promise<IVideoItem[]>((resolve, reject) => {
    const itemList: IVideoItem[] = [];
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const listRef = storageRef(storage, `videos/${user.uid}`);
        try {
          const res = await listAll(listRef);
          res.items.forEach((item) => {
            const { fullPath, name } = item;
            itemList.push({ fullPath, name });
          });
          resolve(itemList);
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(itemList); // 사용자가 인증되지 않은 경우 빈 배열 반환
      }
    });
  });
};

export const getVideoView = async (fullPath: string) => {
  return new Promise<string>((resolve, reject) => {
    const starsRef = storageRef(storage, fullPath);
    try {
      const url = getDownloadURL(starsRef);
      resolve(url);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param baseUrl 공통된 경로
 * @param fileName 파일이름
 * @returns 중복되지 않은 StorageReference
 */
const getReference = async (baseUrl: string, fileName: string) => {
  let count = 0;
  let uniqueFileName = fileName;
  let tryRef = storageRef(storage, baseUrl + "/" + uniqueFileName);
  while (
    await getDownloadURL(tryRef)
      .then(() => true)
      .catch(() => false)
  ) {
    count++;
    const fileExtension = fileName.split(".").pop();
    const nameWithoutExtension = fileName.replace(`.${fileExtension}`, "");
    uniqueFileName = `${nameWithoutExtension}[${count}].${fileExtension}`;
    tryRef = storageRef(storage, baseUrl + "/" + uniqueFileName);
  }
  return tryRef;
};

export const videoUpload = async ({
  userUid,
  file,
}: {
  userUid: string;
  file: File;
}) => {
  const reference = await getReference(`videos/${userUid}`, file.name);

  return uploadBytes(reference, file)
    .then((snapshot) => {
      const metadata = snapshot.metadata;
      return true;
    })
    .catch(() => {
      return false;
    });
};
