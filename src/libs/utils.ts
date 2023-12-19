export const getFileNameFromPath = (filePath: string) => {
  // return "filename.ext" ex) video.mp4
  const fileSplit = filePath.split("/");
  const fileName = fileSplit[fileSplit.length - 1];
  return fileName;
};
