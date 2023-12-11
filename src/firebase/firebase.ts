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
  onValue,
  update,
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
import { SnapshotMetadata } from "firebase/firestore";

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

// Video
export const videoUpload = async ({
  userUid,
  file,
}: {
  userUid: string;
  file: File;
}) => {
  // storage에 파일을 올리고 같은 내용으로 db에도 올린다.
  const reference = await getStorageReference(`videos/${userUid}`, file.name);
  return uploadBytes(reference, file)
    .then((snapshot) => {
      // url = vidoes/userUid/filename.mp4
      const filePath = snapshot.ref.fullPath;
      // let's make db
      writeDbVideoUpload({ userUid, filePath });

      return true;
    })
    .catch(() => {
      return false;
    });
};

export const writeDbVideoUpload = async ({
  userUid,
  filePath,
}: {
  userUid: string;
  filePath: string;
}) => {
  const splitPath = filePath.split("/"); // '/'를 기준으로 문자열을 분할하여 배열 생성
  const fileName = splitPath[splitPath.length - 1].split(".")[0];
  const path = `files/${userUid}/${fileName}`;
  console.log("1path", path);
  const dbRef = await getDatabaseReference(path);
  databaseSet(dbRef, {
    filePath,
    state: "pause",
  });
};

const getDatabaseReference = async (path: string) => {
  let tryPath = path;
  let count = 0;
  while (
    await get(databaseRef(database, path)).then((snapshot) => snapshot.exists())
  ) {
    count++;
    tryPath = tryPath + `_${count}`;
  }
  console.log(tryPath);
  return databaseRef(database, tryPath);
};

export interface VideoDbData {
  [key: string]: { filePath: string; state: string };
}

export const getVideoDb = async (
  userUid: string,
  callback: (data: VideoDbData) => void
) => {
  const videoRef = databaseRef(database, `files/${userUid}`);
  onValue(videoRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const setVideoPlay = async ({
  userUid,
  key,
}: {
  userUid: string;
  key: string;
}) => {
  const videoRef = databaseRef(database, `files/${userUid}`);
  const snapshot = await get(videoRef);
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      if (childKey === key) {
        update(databaseRef(database, `files/${userUid}/${key}`), {
          state: "play",
        });
      } else {
        update(databaseRef(database, `files/${userUid}/${childKey}`), {
          state: "pause",
        });
      }
    });
  }

  // const keyVideoRef = databaseRef(database, `files/${userUid}/${key}`);
  // update(videoRef, { state: "play" });
};

export const getCurrentVideo = (userUid: string) => {
  const currentVideoRef = databaseRef(database, `currentVideo/${userUid}`);
  onValue(currentVideoRef, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
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
const getStorageReference = async (baseUrl: string, fileName: string) => {
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
    uniqueFileName = `${nameWithoutExtension}_${count}.${fileExtension}`;
    tryRef = storageRef(storage, baseUrl + "/" + uniqueFileName);
  }
  return tryRef;
};

export const setCurrentVideo = async ({
  userUid,
  filePath,
}: {
  userUid: string;
  filePath: string;
}) => {
  databaseSet(databaseRef(database, `currentVideo/${userUid}`), {
    filePath,
    state: "play",
  });
};
