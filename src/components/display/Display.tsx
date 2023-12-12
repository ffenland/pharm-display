import {
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
import { IVideoInfo } from "../../types/display";
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
    { filePath: string; state: string; key: string }[]
  >([]);

  const [chosen, setChosen] = useState<IVideoInfo>({
    key: "",
    filePath: "",
    state: "",
  });

  const onItemClick = (keyCode: string) => {
    const chosenItem = monitorList?.find((monitor) => monitor.key === keyCode);
    if (chosenItem) {
      setChosen({
        key: keyCode,
        filePath: chosenItem.filePath,
        state: chosenItem.state,
      });
    }
    onOpen();
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
    if (user) {
      getMonitorList({
        keyCode: user.keyCode,
        callBack: (monitors) => {
          setMonitorList(monitors);
        },
      });
    }
  }, [user]);
  useEffect(() => {
    if (user && user?.keyCode) {
      const keyCode = user.keyCode;
      getVideoDb(keyCode, (data: VideoDbData) => {
        const videoListSet: { filePath: string; state: string; key: string }[] =
          [];
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
      <HStack>
        <Text>당신의 KeyCode는 </Text>
        <Text fontWeight={"bold"}>{user?.keyCode}</Text>
        <Text>입니다.</Text>
      </HStack>
      <Grid templateColumns={"repeat(2, 1fr)"} gap={5} w="full">
        {monitorList
          ? monitorList.map((monitor) => {
              const slashString = monitor.filePath.split("/");
              const fileName =
                slashString[slashString.length - 1].split(".")[0];
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
                      <Text>KeyID : </Text>
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
          : null}
      </Grid>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>{chosen.key}의 정보</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <HStack>
                <Text>filePath</Text>
                <Text>{chosen.filePath}</Text>
              </HStack>
              <HStack border={"1px"} p={2}>
                <Text>상태</Text>
                <Button
                  onClick={() => {
                    onStateToggle({
                      monitorId: chosen.key,
                      state: chosen.state,
                    });
                  }}
                >
                  <Text>{chosen.state}</Text>
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
                        monitorId: chosen.key,
                        filePath: video.filePath,
                      });
                    }}
                  >
                    <VStack w="full">
                      <HStack>
                        <Text>filePath</Text>
                        <Text>{video.filePath}</Text>
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
