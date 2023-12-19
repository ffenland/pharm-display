import { useEffect, useState } from "react";
import { getMonitorList } from "../../firebase/firebase";
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
} from "@chakra-ui/react";

const DisplayMonitor = ({ keyCode }: { keyCode: string }) => {
  const [monitorList, setMonitorList] = useState<
    { key: string; filePath: string; state: string }[]
  >([]);

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

  useEffect(() => {
    getMonitorList({
      keyCode,
      callBack: (monitors) => {
        setMonitorList(monitors);
      },
    });
  }, [keyCode]);

  console.log(monitorList);
  return (
    <>
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
        ) : (
          <Box>
            <Text>현재 등록된 모니터가 없습니다. 모니터를 등록해주세요.</Text>
          </Box>
        )}
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
    </>
  );
};

export default DisplayMonitor;
