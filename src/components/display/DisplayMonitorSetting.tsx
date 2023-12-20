import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import type { Unsubscribe } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  editMonitorFiles,
  listenOneMonitor,
  listenVideosInfo,
} from "../../firebase/firebase";
import { useAuthContext } from "../../libs/useAuthContext";
import { IMonitorOne, IVideosInfo } from "../../types/types";

const arraysAreEqual = (
  arr1: string[] | undefined,
  arr2: string[] | undefined
) => {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) {
    return false;
  }

  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
};

const DisplayMonitorSetting = () => {
  const {
    authState: { user },
  } = useAuthContext();
  const [searchParams] = useSearchParams();
  const monitorId = searchParams.get("id");

  const [monitor, setMonitor] = useState<IMonitorOne | null>();
  const firstFiles = useRef<string[]>();
  const [videos, setVideos] = useState<{ fileName: string; file: string }[]>();

  const onDelete = (filePath: string) => {
    if (!monitor) return;
    if (monitor.files.findIndex((file) => file === filePath) !== -1) {
      // let's delete
      setMonitor((prev) => {
        if (!prev) {
          return prev;
        } else {
          return {
            ...prev,
            files: prev.files.filter((file) => file !== filePath),
          };
        }
      });
    }
  };

  const onAdd = (filePath: string) => {
    if (!monitor) return;
    if (monitor.files.findIndex((file) => file === filePath) === -1) {
      setMonitor((prev) => {
        if (!prev) {
          return prev;
        } else {
          return {
            ...prev,
            files: [
              ...prev.files.filter((file) => file !== filePath),
              filePath,
            ],
          };
        }
      });
    }
  };

  const onSaveList = async () => {
    if (!monitor || !user || !monitorId) return;
    const newFiles = [...monitor.files];
    await editMonitorFiles({
      keyCode: user.keyCode,
      monitorId,
      files: newFiles,
    });
  };

  useEffect(() => {
    let unsubscribePromise: Promise<Unsubscribe>;
    if (monitorId && user) {
      const keyCode = user.keyCode;
      const callback = (monitor: IMonitorOne | null) => {
        setMonitor(monitor);
        if (monitor) {
          firstFiles.current = monitor.files;
        }
      };
      unsubscribePromise = listenOneMonitor({ keyCode, monitorId, callback });
    }
    return () => {
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
  }, [monitorId, user]);

  useEffect(() => {
    let unsubscribePromise: Promise<Unsubscribe> | undefined;
    if (user) {
      const keyCode = user.keyCode;
      const callback = (videos: IVideosInfo) => {
        const videoKeys = Object.keys(videos);
        const videoFiles = videoKeys.map((key) => {
          const video = videos[key];
          const fileSplit = video.path.split("/");
          const fileName = fileSplit[fileSplit.length - 1];
          return { fileName, file: video.path };
        });
        setVideos(videoFiles);
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

  if (monitor === undefined) {
    return (
      <Box py="10" textAlign={"center"} rounded={"lg"} mt="10">
        <Text fontSize={"3xl"}>로딩중</Text>
      </Box>
    );
  } else if (monitor === null) {
    return (
      <Box bg="red.600" py="10" textAlign={"center"} rounded={"lg"} mt="10">
        <Text color={"white"} fontSize={"3xl"}>
          등록되지 않은 모니터 입니다...
        </Text>
      </Box>
    );
  } else {
    return (
      <VStack w="full" p={"10"} bgColor={"gray.50"} borderRadius={"md"}>
        <VStack w="full">
          <Text fontSize={"lg"} fontWeight={"bold"}>
            모니터에 등록된 동영상 목록
          </Text>
          {monitor.files.length > 0
            ? monitor.files.map((file) => {
                const fileSplit = file.split("/");
                const fileName = fileSplit[fileSplit.length - 1];
                return (
                  <Box w="full" key={fileName}>
                    {fileName}
                  </Box>
                );
              })
            : null}
        </VStack>
        <VStack w="full" mt="16">
          <Text fontSize={"lg"} fontWeight={"bold"}>
            업로드 된 동영상 목록
          </Text>
          {videos?.map((video) => {
            const isAdded =
              monitor.files.findIndex((file) => file === video.file) !== -1;
            return (
              <HStack
                key={video.fileName}
                w="full"
                justifyContent={"space-between"}
              >
                <Text>{video.fileName}</Text>
                {isAdded ? (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      onDelete(video.file);
                    }}
                  >
                    Del
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => {
                      onAdd(video.file);
                    }}
                  >
                    Add
                  </Button>
                )}
              </HStack>
            );
          })}
        </VStack>
        <Button
          colorScheme="blue"
          isDisabled={arraysAreEqual(monitor.files, firstFiles.current)}
          mt="8"
          size="lg"
          onClick={onSaveList}
        >
          저장하기
        </Button>
      </VStack>
    );
  }
};

export default DisplayMonitorSetting;
