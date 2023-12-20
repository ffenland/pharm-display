import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../libs/useAuthContext";
import { IVideosInfo } from "../../types/types";
import { listenVideosInfo } from "../../firebase/firebase";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import type { Unsubscribe } from "firebase/database";

const VideoList = ({ videos }: { videos: IVideosInfo }) => {
  const keys = Object.keys(videos);
  return (
    <VStack w="full">
      {keys.map((key) => {
        const video = videos[key];
        const pathSplit = video.path.split("/");
        const fileName = pathSplit[pathSplit.length - 1];
        return (
          <HStack
            key={key}
            w="full"
            justifyContent={"space-between"}
            pb={"1"}
            borderBottom={"2px"}
            borderColor={"pink.100"}
          >
            <HStack>
              <Text>{fileName}</Text>
            </HStack>
            <Button colorScheme="pink" size="sm">
              삭제
            </Button>
          </HStack>
        );
      })}
    </VStack>
  );
};

const DisplayVideos = () => {
  // show uploaded videos
  const {
    authState: { user },
  } = useAuthContext();

  const [videos, setVideos] = useState<IVideosInfo>();
  useEffect(() => {
    let unsubscribePromise: Promise<Unsubscribe> | undefined;
    if (user) {
      const keyCode = user.keyCode;
      const callback = (videos: IVideosInfo) => {
        setVideos(videos);
      };
      unsubscribePromise = listenVideosInfo({ keyCode, callback });
      () => {
        if (unsubscribePromise) {
          unsubscribePromise
            .then((unsubscribe) => {
              // Call the unsubscribe function when the Promise resolves
              unsubscribe();
            })
            .catch((error) => {
              // Handle any errors if unsubscribePromise rejects
              console.error("Error while unsubscribing:", error);
            });
        }
      };
    }
  }, [user]);
  return (
    <Box w="full" p={"4"} shadow={"md"} rounded={"md"}>
      <Box mb={"3"}>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          업로드한 동영상들
        </Text>
      </Box>
      {videos ? (
        <VideoList videos={videos} />
      ) : (
        <Text fontSize={"sm"} color={"red.500"}>
          업로드된 동영상이 없습니다.
        </Text>
      )}
    </Box>
  );
};

export default DisplayVideos;
