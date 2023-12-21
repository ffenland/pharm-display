import Cookie from "js-cookie";

import axios from "axios";
import { auth } from "../firebase/firebase";
import { QueryFunctionContext } from "@tanstack/react-query";

export const staticPath = "http://boripharma.ipdisk.co.kr:9875/static/";

export const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://boripharma.ipdisk.co.kr:9875/api/v1/"
      : "http://boripharma.ipdisk.co.kr:9875/api/v1/",
});

export const getMe = async () => {
  const idToken = "h";
  return instance
    .get("users/me/", {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
        Authorization: `Bearer ${idToken}`,
      },
    })
    .then((response) => response.data);
};

export const videoUploadApi = async ({
  idToken,
  file,
  keyCode,
}: {
  idToken: string;
  file: File;
  keyCode: string;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("key_code", keyCode);
  return instance
    .post("videos/", formData, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
        Authorization: `Bearer ${idToken}`, // Firebase 토큰을 Bearer 토큰으로 전달
        // "Content-Type": "application/json", // 필요한 경우 Content-Type 설정
      },
    })
    .then((response) => response.data);
};

export const videoDeleteApi = async ({
  idToken,
  filePath,
}: {
  idToken: string;
  filePath: string;
}) =>
  instance.put(
    "videos/",
    { filePath },
    {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
        Authorization: `Bearer ${idToken}`, // Firebase 토큰을 Bearer 토큰으로 전달
        // "Content-Type": "application/json", // 필요한 경우 Content-Type 설정
      },
    }
  );

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
