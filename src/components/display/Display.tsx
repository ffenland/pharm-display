import { useEffect, useState } from "react";
import { getVideoList, getVideoView } from "../../firebase/firebase";
import { IVideoItem } from "../../types/display";
import { Box, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Display = () => {
  const [videoList, setVideoList] = useState<IVideoItem[]>();
  const [videoCode, setVideoCode] = useState("");
  const onVideoClick = async (fullPath: string) => {
    const link = await getVideoView(fullPath);
    // 비디오 링크 상태 업데이트
    console.log(link);
    setVideoCode(link);
  };

  useEffect(() => {
    const getFBVideoList = async () => {
      const list = await getVideoList();
      setVideoList(list);
    };
    getFBVideoList();
  }, []);
  return (
    <VStack>
      <Text>Hi Here is your Videos</Text>
      <VStack>
        {videoList?.map((video) => {
          return (
            <Link key={video.name}>
              <Text>{video.name}</Text>
            </Link>
          );
        })}
      </VStack>
      <video
        src={videoCode}
        controls
        autoPlay
        style={
          videoCode.length > 1
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 9999,
              }
            : undefined
        }
      />
    </VStack>
  );
};

export default Display;
