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
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";
import { videoDeleteApi, videoUploadApi } from "../libs/api";
import {
  IMonitorOne,
  IMonitorsInfo,
  IUserWithToken,
  IVideosInfo,
} from "../types/types";

export interface AdminUser extends User {
  isAdmin: boolean;
  keyCode: string;
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

const generateRandomKeyCode = () => {
  const min = 100000; // Minimum value (6-digit number)
  const max = 999999; // Maximum value (6-digit number)
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const createUniqueKeyCode = async () => {
  // 중복되지 않는 keyCode를 만들자.
  // 랜덤을 만들고,
  let exist = true;
  let keyCode = "";
  while (exist) {
    keyCode = generateRandomKeyCode();
    exist = false;
    const checkRef = databaseRef(database, "keyCode/");
    const checkSnapshot = await get(checkRef);
    checkSnapshot.forEach((snapshot) => {
      if (snapshot.val() === keyCode) {
        // 동일한 키코드가 있다면 exist를 true로.
        exist = true;
      }
    });
  }
  return keyCode;
};

export const googleLogin = async () => {
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const userKeycodeRef = databaseRef(
      database,
      `keyCode/${userCredential.user.uid}`
    );
    const userKeycodeSnapshot = await get(userKeycodeRef);
    if (!userKeycodeSnapshot.exists()) {
      // Generate a random 6-digit keycode
      // check key already exists.
      const randomKeyCode = await createUniqueKeyCode();

      // Save the keycode in the database at /keyCode/{user.uid}
      await databaseSet(userKeycodeRef, randomKeyCode);
      console.log("Keycode saved successfully:", randomKeyCode);
    } else {
      console.log(
        "Keycode already exists for this user:",
        userKeycodeSnapshot.val()
      );
    }
    return userCredential;
  } catch (error) {
    console.log(error);
  }
};

export const logout = async () => {
  return signOut(auth);
};

export const isValidKeyCode = async (keyCode: string) => {
  let exist = false;
  const checkRef = databaseRef(database, "keyCode/");
  const checkSnapshot = await get(checkRef);
  checkSnapshot.forEach((snapshot) => {
    if (snapshot.val() === keyCode) {
      exist = true;
    }
  });

  return exist;
};

export const getKeyCode = async (uid: string) =>
  get(databaseRef(database, `keyCode/${uid}`)).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val() as string;
    } else {
      return undefined;
    }
  });

export const onUserStateChanged = (
  callback: (user: IUserWithToken | null) => void,
  onError: (error: Error) => void
) =>
  onAuthStateChanged(
    auth,
    async (user: User | null) => {
      if (user) {
        const idToken = await user.getIdToken();
        const keyCode = await getKeyCode(user.uid);
        if (!keyCode) {
          callback(null);
        } else {
          callback({ ...user, idToken, keyCode });
        }
      } else {
        callback(null);
      }
    },
    onError
  );

// video 파일 업로드
export const videoUpload = async ({
  keyCode,
  file,
}: {
  keyCode: string;
  file: File;
}) => {
  if (!auth.currentUser) return false;

  try {
    // write to django
    const idToken = await auth.currentUser.getIdToken();
    await videoUploadApi({ idToken, file, keyCode });
    return true;
  } catch (error) {
    return false;
  }
};

// 업로드된 video 파일 삭제
export const videoDelete = async ({ filePath }: { filePath: string }) => {
  // ref가 여러개다.
  //모니터에 연결된 파일들 삭제
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) return false;
  const result = await videoDeleteApi({ idToken, filePath });
  return result;
};

// 업로드된 Videos 목록 DB 리스너 등록
export const listenVideosInfo = async ({
  keyCode,
  callback,
}: {
  keyCode: string;
  callback: (data: IVideosInfo) => void;
}) => {
  const videoRef = databaseRef(database, `files/${keyCode}`);
  return onValue(videoRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// 모니터 DB 리스너 등록
// DisplayMonitors
export const listenMonitorsInfo = async ({
  keyCode,
  callback,
}: {
  keyCode: string;
  callback: (monitors: IMonitorsInfo) => void;
}) => {
  const monitorsRef = databaseRef(database, `monitors/${keyCode}`);
  return onValue(monitorsRef, (snapshot) => {
    const monitors: IMonitorsInfo = {};
    snapshot.forEach((child) => {
      monitors[child.key] = { ...child.val() };
    });
    callback(monitors);
  });
};
// 새로운 모니터 등록 at Monitor.tsx
export const addNewMonitor = async ({
  keyCode,
  monitorId,
}: {
  keyCode: string;
  monitorId: string;
}) => {
  const monitorRef = databaseRef(database, `monitors/${keyCode}/${monitorId}`);
  await databaseSet(monitorRef, {
    currentIndex: 0,
    files: [],
    state: "pause",
  });
};
// 개별 모니터 DB 리스너 등록
export const listenOneMonitor = async ({
  keyCode,
  monitorId,
  callback,
}: {
  keyCode: string;
  monitorId: string;
  callback: (monitor: IMonitorOne | null) => void;
}) => {
  const monitorRef = databaseRef(database, `monitors/${keyCode}/${monitorId}`);
  return onValue(monitorRef, (snapshot) => {
    const value = snapshot.val();
    if (value === null) {
      callback(null);
    } else {
      const monitor = {
        currentIndex: value.currentIndex || 0,
        files: value.files || [],
        state: value.state || "pause",
      };
      callback(monitor);
    }
  });
};

export const editMonitorFiles = async ({
  keyCode,
  monitorId,
  files,
}: {
  keyCode: string;
  monitorId: string;
  files: string[];
}) => {
  const monitorsRef = databaseRef(
    database,
    `monitors/${keyCode}/${monitorId}/files`
  );
  databaseSet(monitorsRef, files);
};
