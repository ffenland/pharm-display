import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
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
import { useEffect, useRef, useState } from "react";

import {
  addNewMonitor,
  isValidKeyCode,
  listenOneMonitor,
} from "../../firebase/firebase";
import { useForm } from "react-hook-form";
import { IMonitorOne } from "../../types/types";
import type { Unsubscribe } from "firebase/database";

const Monitor = () => {
  const [code, setCode] = useState({ keyCode: "", monitorId: "" });
  const [monitor, setMonitor] = useState<IMonitorOne | null>();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isKeyError, setIsKeyError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue } = useForm<{
    keyCode: string;
    monitorId: string;
  }>();

  const onValidKeyCode = async (data: {
    keyCode: string;
    monitorId: string;
  }) => {
    setIsLoading(true);
    const isValid = await isValidKeyCode(data.keyCode);
    setIsLoading(false);
    if (isValid) {
      localStorage.setItem("keyCode", data.keyCode);
      localStorage.setItem("monitorId", data.monitorId);
      setCode({ keyCode: data.keyCode, monitorId: data.monitorId });
      setIsKeyError(false);
      setValue("keyCode", "");
      onClose();
      window.location.reload();
    } else {
      setIsKeyError(true);
    }
  };

  useEffect(() => {
    const handleVideoEnd = () => {
      if (!monitor) return;
      setMonitor((prev) => {
        if (!prev) {
          return prev;
        } else {
          if (prev.currentIndex + 1 < prev.files.length) {
            return { ...prev, currentIndex: prev.currentIndex + 1 };
          } else {
            return { ...prev, currentIndex: 0 };
          }
        }
      });
    };
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("ended", handleVideoEnd);
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", handleVideoEnd);
      }
    };
  }, [monitor]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && monitor && monitor.files && monitor.files.length > 0) {
      // Video태그가로딩되고, 파일 목록에 파일이 있을 때만 재생기능 수행
      videoElement.src = monitor.files[monitor.currentIndex];
      videoElement.load();
      videoElement.play();
    }
  }, [monitor, videoRef]);

  useEffect(() => {
    let unsubscribePromise: Promise<Unsubscribe>;
    // 맨 처음 로딩
    const keyCode = localStorage.getItem("keyCode");
    const monitorId = localStorage.getItem("monitorId");
    if (!keyCode || !monitorId) {
      if (keyCode && keyCode.length > 0) {
        setValue("keyCode", keyCode);
      }
      if (monitorId && monitorId.length > 0) {
        setValue("monitorId", monitorId);
      }
      // 등록 modal 열기
      onOpen();
    } else {
      setCode(() => ({ keyCode, monitorId }));
      const callback = (monitor: IMonitorOne | null) => {
        setMonitor(monitor);
      };
      unsubscribePromise = listenOneMonitor({
        keyCode,
        monitorId,
        callback,
      });
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
  }, [onOpen, setValue]);
  useEffect(() => {
    if (monitor === null && code.keyCode !== "" && code.monitorId !== "") {
      // 등록되지 않은 모니터의 경우,
      // DB에 등록을 하고 페이지를 새로고침 한다.
      const createMonitor = async ({
        keyCode,
        monitorId,
      }: {
        keyCode: string;
        monitorId: string;
      }) => {
        await addNewMonitor({ keyCode, monitorId });
        window.location.reload();
      };
      createMonitor({ keyCode: code.keyCode, monitorId: code.monitorId });
    }
  }, [monitor, code]);
  return (
    <>
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
        <video ref={videoRef} muted style={{ width: "100%", height: "100%" }} />
      </Box>
      <Modal
        isOpen={isOpen || code.monitorId.length < 1 || code.keyCode.length < 1}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>키코드 입력</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack as="form" onSubmit={handleSubmit(onValidKeyCode)}>
              <FormControl>
                <FormLabel>키 코드</FormLabel>
                {isKeyError ? (
                  <Text fontSize={"sm"} color="red">
                    올바른 키코드가 아닙니다.
                  </Text>
                ) : null}
                <Input
                  {...register("keyCode")}
                  type="text"
                  placeholder="마스터 화면의 키코드를 입력하세요."
                />
              </FormControl>
              <FormControl>
                <FormLabel>모니터 번호</FormLabel>
                <Input
                  {...register("monitorId")}
                  type="text"
                  placeholder="모니터를 구분할 수 있는 id를 넣어주세요 예)1"
                />
              </FormControl>
              <Button isDisabled={isLoading} type="submit">
                완료
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Monitor;

/*
처음부터 영상의 목록을 받아올 것이 아니라,
index 값을 전달하면 해당 index의 영상링크값을 받아 오게 해서,
영상이 끝나면 다음 영상 주소를 요청해서 받아오는 형식으로 만들면
현재 무슨 영상이 재생되고 있는지도 실시간으로 확인이 가능하다.

허나.. DB에 부담을 주면서 그렇게 해야할까?
*/
