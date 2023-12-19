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
  getDownloadURL,
} from "firebase/storage";
import { staticPath, videoUploadApi } from "../libs/api";
import { IUserWithToken } from "../types/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { getFileNameFromPath } from "../libs/utils";

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
        callback({ ...user, idToken, keyCode: keyCode ? keyCode : null });
      } else {
        callback(null);
      }
    },
    onError
  );

export const videoUpload = async ({
  keyCode,
  idToken,
  file,
}: {
  keyCode: string;
  idToken: string;
  file: File;
}) => {
  try {
    // write to django
    await videoUploadApi({ idToken, file, keyCode });
    return true;
  } catch (error) {
    return false;
  }
};

export const writeDbVideoUpload = async ({
  keyCode,
  filePath,
}: {
  keyCode: string;
  filePath: string;
}) => {
  const splitPath = filePath.split("/"); // '/'를 기준으로 문자열을 분할하여 배열 생성
  const fileName = splitPath[splitPath.length - 1].split(".")[0];
  const path = `files/${keyCode}/${fileName}`;
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
  return databaseRef(database, tryPath);
};

export interface VideoDbData {
  [key: string]: { path: string; state: string };
}

export const getVideoDb = async (
  keyCode: string,
  callback: (data: VideoDbData) => void
) => {
  const videoRef = databaseRef(database, `files/${keyCode}`);
  onValue(videoRef, (snapshot) => {
    const data = snapshot.val();

    callback(data);
  });
};

export const setVideoPlay = async ({
  keyCode,
  key,
}: {
  keyCode: string;
  key: string;
}) => {
  const videoRef = databaseRef(database, `files/${keyCode}`);
  const snapshot = await get(videoRef);
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      if (childKey === key) {
        update(databaseRef(database, `files/${keyCode}/${key}`), {
          state: "play",
        });
      } else {
        update(databaseRef(database, `files/${keyCode}/${childKey}`), {
          state: "pause",
        });
      }
    });
  }

  // const keyVideoRef = databaseRef(database, `files/${userUid}/${key}`);
  // update(videoRef, { state: "play" });
};

export const getVideoView = async (fullPath: string) => {
  return new Promise<string>((resolve, reject) => {
    const starsRef = storageRef(storage, fullPath);
    try {
      const url = getDownloadURL(starsRef);
      resolve(url);
    } catch (error) {
      reject("");
    }
  });
};

/**
 *
 * @param baseUrl 공통된 경로
 * @param fileName 파일이름
 * @returns 중복되지 않은 StorageReference
 */

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

export interface ImonitorData {
  filePath: string;
  state: string;
}

export const monitorSignup = async ({
  keyCode,
  monitorId,
  callback,
}: {
  keyCode: string;
  monitorId: string;
  callback: (data: ImonitorData) => void;
}) => {
  const monitorRef = databaseRef(database, `monitors/${keyCode}/${monitorId}`);
  onValue(monitorRef, async (snapshot) => {
    const data: ImonitorData | null = snapshot.val();
    if (data === null) {
      databaseSet(monitorRef, { filePath: "", state: "pause" });
    } else {
      const filePath = data.filePath;

      callback({ filePath: filePath, state: data.state });
    }
  });
};

export const getMonitorList = async ({
  keyCode,
  callBack,
}: {
  keyCode: string;
  callBack: (monitors: {
    [keys: string]: { files: string[]; state: string };
  }) => void;
}) => {
  const monitorsRef = databaseRef(database, `monitors/${keyCode}`);
  onValue(monitorsRef, (snapshot) => {
    const monitors: { [keys: string]: { files: string[]; state: string } } = {};
    snapshot.forEach((child) => {
      monitors[child.key] = { ...child.val() };
    });

    callBack(monitors);
  });
};

export const addFileToMonitorFilelist = async ({
  keyCode,
  monitorId,
  filePath,
}: {
  keyCode: string;
  monitorId: string;
  filePath: string;
}) => {
  const monitorsRef = databaseRef(
    database,
    `monitors/${keyCode}/${monitorId}/files`
  );
  onValue(
    monitorsRef,
    (snapshot) => {
      const filesArray = snapshot.val() || [];
      filesArray.push(filePath);
      databaseSet(monitorsRef, filesArray);
    },
    { onlyOnce: true }
  );
};

export const setVideoToMonitor = async ({
  keyCode,
  monitorId,
  filePath,
}: {
  keyCode: string;
  monitorId: string;
  filePath: string;
}) => {
  const monitorRef = databaseRef(
    database,
    `monitors/${keyCode}/${monitorId}/files`
  );
  onValue(
    monitorRef,
    (snapshot) => {
      const filesArray = snapshot.val() || [];
      console.log(filesArray);
    },
    { onlyOnce: true }
  );
};

export const setVideoState = async ({
  keyCode,
  monitorId,
  state,
}: {
  keyCode: string;
  monitorId: string;
  state: string;
}) => {
  const monitorRef = databaseRef(database, `monitors/${keyCode}/${monitorId}`);
  await update(monitorRef, { state });
};
