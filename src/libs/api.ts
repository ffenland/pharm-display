import Cookie from "js-cookie";
import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";

export const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000/api/v1/"
      : "http://127.0.0.1:8000/api/v1/",
  withCredentials: false,
});

export const videoTest = async ({
  idToken,
  file,
}: {
  idToken: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("idToken", idToken);
  return instance
    .post("videos/", formData, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken") || "",
      },
    })
    .then((response) => response.data);
};
