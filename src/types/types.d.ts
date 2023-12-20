import { User } from "firebase/auth";

export interface IDisplayUploadForm {
  video: FileList;
}

export interface IVideoItem {
  fullPath: string;
  name: string;
}

export interface IVideoInfo {
  key: string;
  filePath: string;
  state: string;
}

export interface IMonitor {
  monitorId: string;
  filePath: string;
  state: string;
}

export interface IMe {
  uid: string;
  keyCode: string;
}

export interface IUserWithToken extends User {
  idToken: string;
  keyCode: string;
}
export interface IMonitorOne {
  files: string[];
  state: string;
  currentIndex: number;
}
export interface IMonitorsInfo {
  [keys: string]: IMonitorOne;
}
export interface IVideosInfo {
  [key: string]: { path: string; state: string };
}
