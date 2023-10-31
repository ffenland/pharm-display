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
import { useAuthContext } from "../../libs/useAuthContext";
import { useMutation } from "@tanstack/react-query";
import { videoUpload } from "../../firebase/firebase";

const DisplayUpload = () => {
  const {
    authState: { user },
  } = useAuthContext();
  const mutation = useMutation(videoUpload, {});
  const { register, handleSubmit, getValues, watch } = useForm<{
    video: FileList;
  }>();
  const attached = watch("video");
  const onValid = (data: { video: FileList }) => {
    if (!user) return;
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
        {attached ? (
          <Text fontSize={"xs"}>{`${attached[0].name}... 첨부됨.`}</Text>
        ) : null}
      </FormControl>
      <Button type="submit">업로드</Button>
    </VStack>
  );
};

export default DisplayUpload;
