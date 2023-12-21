import { useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { videoUpload } from "../../firebase/firebase";
import { IDisplayUploadForm } from "../../types/types";
import { useAuthContext } from "../../libs/useAuthContext";
import { useNavigate } from "react-router-dom";

const DisplayUpload = () => {
  const navigate = useNavigate();
  const {
    authState: { user },
  } = useAuthContext();
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, watch } = useForm<IDisplayUploadForm>();

  const attached = watch("video");

  const onValid = async (data: IDisplayUploadForm) => {
    if (!user || isUploading) return;
    setIsUploading(true);
    const result = await videoUpload({
      keyCode: user.keyCode,
      file: data.video[0],
    });
    setIsUploading(false);
    if (result) {
      navigate("/display");
    }
  };

  return (
    <VStack maxW="lg" as="form" mx="auto" onSubmit={handleSubmit(onValid)}>
      <FormControl>
        <FormLabel>
          <Flex
            h={10}
            rounded={"xl"}
            shadow={"lg"}
            fontWeight={"bold"}
            fontSize={"sm"}
            justifyContent={"center"}
            alignItems={"center"}
            cursor={"pointer"}
            _hover={{ bg: "gray.100" }}
          >
            동영상 첨부
          </Flex>
          <Input type="file" {...register("video")} accept="video/*" hidden />
        </FormLabel>
        {attached && attached.length > 0 ? (
          <Text fontSize={"xs"}>{`${attached[0].name}... 첨부됨.`}</Text>
        ) : null}
      </FormControl>
      <Button
        type="submit"
        isDisabled={isUploading || !attached || attached.length < 1}
      >
        업로드
      </Button>
    </VStack>
  );
};

export default DisplayUpload;
