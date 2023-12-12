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
