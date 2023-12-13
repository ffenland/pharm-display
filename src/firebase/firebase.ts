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
  uploadBytes,
} from "firebase/storage";

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
  let exist = true;
  let keyCode = "";
  while (exist) {
    keyCode = generateRandomKeyCode();
    exist = false;
    const checkRef = databaseRef(database, "keyCode/");

    const checkSnapshot = await get(checkRef);
    checkSnapshot.forEach((snapshot) => {
      if (snapshot.val() === keyCode) {
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

export const onUserStateChanged = (
  callback: (user: AdminUser | null) => void,
  onError: (error: Error) => void
) =>
  onAuthStateChanged(
    auth,
    async (user: User | null) => {
      const adminAddedUser = user && (await addIsAdminKeyCode(user));
      callback(adminAddedUser);
    },
    onError
  );
const addIsAdminKeyCode = async (user: User) => {
  let isAdmin = false;
  let keyCode = "";
  await get(databaseRef(database, "admins")) //
    .then((snapshot) => {
      if (snapshot.exists()) {
        const admins: string[] = snapshot.val();
        isAdmin = admins.includes(user.uid);
      }
    });
  await get(databaseRef(database, `keyCode/${user.uid}`)) //
    .then((snapshot) => {
      if (snapshot.exists()) {
        keyCode = snapshot.val();
      }
    });
  return { ...user, isAdmin, keyCode };
};

// Video
export const videoUpload = async ({
  keyCode,
  file,
}: {
  keyCode: string;
  file: File;
}) => {
  // storage에 파일을 올리고 같은 내용으로 db에도 올린다.
  const reference = await getStorageReference(`videos/${keyCode}`, file.name);
  return uploadBytes(reference, file)
    .then((snapshot) => {
      // url = vidoes/keyCode/filename.mp4
      const filePath = snapshot.ref.fullPath;
      // let's make db
      writeDbVideoUpload({ keyCode, filePath });

      return true;
    })
    .catch(() => {
      return false;
    });
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
  [key: string]: { filePath: string; state: string; fileName: string };
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
      //const filePath = await getVideoView(data.filePath);
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
  callBack: (
    monitors: { key: string; filePath: string; state: string }[]
  ) => void;
}) => {
  const monitorsRef = databaseRef(database, `monitors/${keyCode}`);
  onValue(monitorsRef, (snapshot) => {
    const monitors: { key: string; filePath: string; state: string }[] = [];
    snapshot.forEach((child) => {
      monitors.push({ key: child.key, ...child.val() });
    });
    callBack(monitors);
  });
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
  const monitorRef = databaseRef(database, `monitors/${keyCode}/${monitorId}`);
  await databaseSet(monitorRef, { filePath, state: "play" });
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

export const nasVideoLinkUpload = async ({
  link,
  keyCode,
  fileName,
}: {
  link: string;
  keyCode: string;
  fileName: string;
}) => {
  const dbRef = databaseRef(database, `files/${keyCode}/${fileName}`);
  return databaseSet(dbRef, { filePath: link, state: "pause", fileName })
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
};
