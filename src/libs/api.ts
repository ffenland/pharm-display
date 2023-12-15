import Cookie from "js-cookie";

import axios from "axios";
import { auth } from "../firebase/firebase";

export const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000/api/v1/"
      : "http://127.0.0.1:8000/api/v1/",
});

export const videoTest = async ({ file }: { file: File }) => {
  const idToken = await auth.currentUser?.getIdToken();
  const formData = new FormData();
  formData.append("file", file);

  if (!idToken) {
    return false;
  } else {
    return instance
      .post("videos/upload/", formData, {
        headers: {
          "X-CSRFToken": Cookie.get("csrftoken") || "",
          Authorization: `Bearer ${idToken}`, // Firebase 토큰을 Bearer 토큰으로 전달
          // "Content-Type": "application/json", // 필요한 경우 Content-Type 설정
        },
      })
      .then((response) => response.data);
  }
};

interface IMeResponse {
  ok: boolean;
  user: {
    uid: string;
    key_code: string;
  };
}
export const me = async (): Promise<IMeResponse | undefined> => {
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    return undefined;
  } else {
    return instance
      .get("users/me/", {
        headers: {
          "X-CSRFToken": Cookie.get("csrftoken") || "",
          Authorization: `Bearer ${idToken}`, // Firebase 토큰을 Bearer 토큰으로 전달
          // "Content-Type": "application/json", // 필요한 경우 Content-Type 설정
        },
      })
      .then((response) => response.data);
  }
};
