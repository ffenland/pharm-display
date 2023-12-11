import { useEffect, useState } from "react";
import { VideoDbData, getVideoDb, setVideoPlay } from "../../firebase/firebase";

import { Button, HStack, Text, VStack } from "@chakra-ui/react";

import { useAuthContext } from "../../libs/useAuthContext";

const Display = () => {
  const {
    authState: { user },
  } = useAuthContext();
  const [videoList, setVideoList] =
    useState<{ filePath: string; state: string; key: string }[]>();

  const onVideoClick = async (key: string) => {
    if (!user) return;
    setVideoPlay({ userUid: user.uid, key: key });
  };

  useEffect(() => {
    if (user) {
      getVideoDb(user.uid, (data: VideoDbData) => {
        const videoListSet: { filePath: string; state: string; key: string }[] =
          [];
        for (const key in data) {
          videoListSet.push({ ...data[key], key });
        }
        setVideoList((prev) => [...[...videoListSet]]);
      });
    }
  }, [user]);

  return (
    <VStack>
      <Text>Hi Here is your Videos</Text>
      <VStack>
        {videoList &&
          videoList?.map((video) => {
            const videoSplit = video.filePath.split("/");
            const videoName = videoSplit[videoSplit.length - 1].split(".")[0];
            return (
              <HStack key={video.filePath}>
                <Text>{videoName}</Text>
                <Button
                  onClick={() => {
                    onVideoClick(video.key);
                  }}
                >
                  {video.state}
                </Button>
              </HStack>
            );
          })}
      </VStack>
    </VStack>
  );
};

export default Display;
