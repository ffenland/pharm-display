import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../libs/useAuthContext";
import { VideoDbData, getVideoDb, getVideoView } from "../../firebase/firebase";
import { Box } from "@chakra-ui/react";

const DisplayShow = () => {
  const {
    authState: { user },
  } = useAuthContext();
  const [videoList, setVideoList] =
    useState<{ filePath: string; state: string; key: string }[]>();

  const [currentVideo, setCurrentVideo] = useState<string>("");

  useEffect(() => {
    if (user) {
      getVideoDb(user.keyCode, (data: VideoDbData) => {
        const videoListSet: { filePath: string; state: string; key: string }[] =
          [];
        for (const key in data) {
          videoListSet.push({ ...data[key], key });
        }
        setVideoList([...videoListSet]);
      });
    }
  }, [user]);
  useEffect(() => {
    const getVideoSrc = async (filePath: string) => {
      const videoLink = await getVideoView(filePath);
      setCurrentVideo(videoLink);
    };
    if (videoList) {
      const currentVideoList = videoList.filter(
        (video) => video.state === "play"
      );
      if (currentVideoList.length > 0) {
        const currentVideo = currentVideoList[0];
        if (currentVideo) {
          getVideoSrc(currentVideo.filePath);
        }
      }
    }
  }, [videoList]);
  return (
    <Box
      position="fixed"
      top={0}
      bottom={0}
      left={0}
      right={0}
      display="flex"
      justifyContent="center"
      alignItems="center"
      backgroundColor="black"
    >
      <video
        src={`${currentVideo}`}
        autoPlay
        loop
        style={{ width: "100%", height: "100%" }}
      />
    </Box>
  );
};

export default DisplayShow;
