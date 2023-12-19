import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IMonitor, IVideoInfo } from "../../types/types";
import { useAuthContext } from "../../libs/useAuthContext";
import { Link } from "react-router-dom";
import {
  VideoDbData,
  getMonitorList,
  getVideoDb,
  setVideoState,
  setVideoToMonitor,
} from "../../firebase/firebase";

const Display = () => {
  const {
    authState: { user },
  } = useAuthContext();

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [monitorList, setMonitorList] = useState<
    { key: string; filePath: string; state: string }[]
  >([]);

  const [videoList, setVideoList] = useState<
    { path: string; state: string; key: string }[]
  >([]);

  const [chosen, setChosen] = useState<{ monitorId: string }>({
    monitorId: "",
  });

  const onItemClick = (monitorId: string) => {
    const chosenItem = monitorList?.find(
      (monitor) => monitor.key === monitorId
    );
    if (chosenItem) {
      setChosen({
        monitorId: monitorId,
      });
      onOpen();
    }
  };

  const onVideoChoice = ({
    monitorId,
    filePath,
  }: {
    monitorId: string;
    filePath: string;
  }) => {
    if (user) {
      setVideoToMonitor({ keyCode: user.keyCode, filePath, monitorId });
    }
  };

  const onStateToggle = ({
    monitorId,
    state,
  }: {
    monitorId: string;
    state: string;
  }) => {
    const newState = state === "pause" ? "play" : "pause";
    if (user) {
      setVideoState({ keyCode: user.keyCode, monitorId, state: newState });
    }
  };

  useEffect(() => {
    if (user && user.keyCode) {
      getVideoDb(user.keyCode, (data: VideoDbData) => {
        const videoListSet: { path: string; state: string; key: string }[] = [];
        for (const key in data) {
          videoListSet.push({ ...data[key], key });
        }
        setVideoList([...videoListSet]);
      });
      getMonitorList({
        keyCode: user.keyCode,
        callBack: (monitors) => {
          setMonitorList(monitors);
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const keyCode = user.keyCode;
      getVideoDb(keyCode, (data: VideoDbData) => {
        const videoListSet: { path: string; state: string; key: string }[] = [];
        for (const key in data) {
          videoListSet.push({ ...data[key], key });
        }
        //setVideoList([...videoListSet]);
      });
    }
  });

  return (
    <VStack w="full">
      <HStack>
        <Text>새로운 동영상이 있으세요?</Text>
        <Button as={Link} to="/display/upload">
          업로드하러가기
        </Button>
      </HStack>

      <Grid templateColumns={"repeat(2, 1fr)"} gap={5} w="full">
        {monitorList && monitorList.length > 0 ? (
          monitorList.map((monitor) => {
            const slashString = monitor.filePath.split("/");
            const fileName = slashString[slashString.length - 1].split(".")[0];
            return (
              <GridItem
                key={monitor.key}
                border={"1px"}
                borderColor={"gray.100"}
                shadow={"lg"}
                rounded={"lg"}
                p={"5"}
                onClick={() => {
                  onItemClick(monitor.key);
                }}
              >
                <VStack>
                  <HStack w="full">
                    <Text>모니터ID : </Text>
                    <Text>{monitor.key}</Text>
                  </HStack>
                  <HStack w="full">
                    <Text>파일명 : </Text>
                    <Text>{fileName}</Text>
                  </HStack>
                  <HStack w="full">
                    <Text>재생정보 : </Text>
                    <Text>{monitor.state}</Text>
                  </HStack>
                </VStack>
              </GridItem>
            );
          })
        ) : (
          <Box>
            <Text>현재 등록된 모니터가 없습니다. 모니터를 등록해주세요.</Text>
          </Box>
        )}
      </Grid>
      <VStack
        w="full"
        alignItems={"start"}
        mt={"5"}
        bgColor={"gray.100"}
        p="4"
        rounded={"md"}
      >
        <Text>업로드된 동영상 목록.</Text>
        {videoList && videoList.length > 0 ? (
          videoList.map((video) => {
            const fileSplit = video.path.split("/");
            const fileName = fileSplit[fileSplit.length - 1];
            return (
              <Box
                key={video.key}
                shadow={"md"}
                bgColor="white"
                p="3"
                rounded={"md"}
              >
                {fileName}
              </Box>
            );
          })
        ) : (
          <Text>한개도 없습니다.</Text>
        )}
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>모니터 {chosen.monitorId}의 정보</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <HStack w="full" overflow={"hidden"}>
                <Text>filePath</Text>
                <Text>
                  {
                    monitorList.find(
                      (monitor) => monitor.key === chosen.monitorId
                    )?.filePath
                  }
                </Text>
              </HStack>
              <HStack border={"1px"} p={2}>
                <Text>상태</Text>
                <Button
                  onClick={() => {
                    onStateToggle({
                      monitorId: chosen.monitorId,
                      state: monitorList.find(
                        (monitor) => monitor.key === chosen.monitorId
                      )
                        ? monitorList.find(
                            (monitor) => monitor.key === chosen.monitorId
                          )!.state
                        : "pause",
                    });
                  }}
                >
                  <Text>
                    {
                      monitorList.find(
                        (monitor) => monitor.key === chosen.monitorId
                      )?.state
                    }
                  </Text>
                </Button>
              </HStack>
            </VStack>
            <Grid
              templateColumns={"repeat(1, 1fr)"}
              gap={2}
              mt={6}
              cursor={"pointer"}
            >
              {videoList.map((video) => {
                return (
                  <GridItem
                    key={video.key}
                    border={"1px"}
                    rounded={"lg"}
                    _hover={{ bgColor: "gray.100" }}
                    py="5"
                    onClick={() => {
                      onVideoChoice({
                        monitorId: chosen.monitorId,
                        filePath: video.path,
                      });
                    }}
                  >
                    <VStack w="full">
                      <HStack>
                        <Text>filePath</Text>
                        <Text>{video.path}</Text>
                      </HStack>
                    </VStack>
                  </GridItem>
                );
              })}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Display;
