import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { nasVideoLinkUpload } from "../../firebase/firebase";
import { IDisplayUploadForm } from "../../types/display";
import { useAuthContext } from "../../libs/useAuthContext";
import { useNavigate } from "react-router-dom";

const DisplayUpload = () => {
  const navigate = useNavigate();
  const {
    authState: { user },
  } = useAuthContext();
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { register, handleSubmit } = useForm<IDisplayUploadForm>();

  const onValid = async (data: IDisplayUploadForm) => {
    if (!user || isUploading) return;
    setIsError(false);
    setIsUploading(true);
    const keyCode = user.keyCode;
    const result = await nasVideoLinkUpload({
      link: data.link,
      fileName: data.fileName,
      keyCode,
    });
    setIsUploading(false);
    if (result) {
      navigate("/display");
    } else {
      setIsError(true);
    }
  };

  return (
    <VStack maxW="lg" as="form" mx="auto" onSubmit={handleSubmit(onValid)}>
      {isError ? <Text>뭔가 에러가 발생!</Text> : null}
      <FormControl>
        <FormLabel>
          <Text>링크주소</Text>
        </FormLabel>
        <Input
          type="text"
          {...register("link", { minLength: 2 })}
          minLength={2}
        />
      </FormControl>
      <FormControl>
        <FormLabel>
          <Text>파일이름</Text>
        </FormLabel>
        <Input
          type="text"
          {...register("fileName", { minLength: 2 })}
          placeholder="뭔지 기억하기 쉬운 짦은 이름"
          minLength={2}
        />
      </FormControl>
      <Button type="submit" isDisabled={isUploading}>
        등록
      </Button>
    </VStack>
  );
};

export default DisplayUpload;
