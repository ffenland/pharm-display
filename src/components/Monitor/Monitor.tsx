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
import React, { useEffect, useState } from "react";

import { isValidKeyCode, monitorSignup } from "../../firebase/firebase";
import { useForm } from "react-hook-form";

const Monitor = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [code, setCode] = useState({ keyCode: "", monitorId: "" });

  const [currentVideo, setCurrentVideo] = useState<{
    filePath: string;
    state: string;
  }>({ filePath: "", state: "pause" });
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
    } else {
      setIsKeyError(true);
    }
  };

  console.log(currentVideo);

  useEffect(() => {
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
      monitorSignup({
        keyCode,
        monitorId,
        callback: (data) => {
          setCurrentVideo({ ...data });
        },
      });
      setCode(() => ({ keyCode, monitorId }));
    }
  }, [onOpen, setValue]);

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
        <video
          src={`${currentVideo.filePath}`}
          autoPlay
          muted
          loop
          style={{ width: "100%", height: "100%" }}
        />
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
