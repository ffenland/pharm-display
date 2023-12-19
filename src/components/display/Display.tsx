import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useAuthContext } from "../../libs/useAuthContext";
import { Link } from "react-router-dom";
import DisplayMonitors from "./DisplayMonitors";
import DisplayVideos from "./DisplayVideos";

const Display = () => {
  return (
    <VStack w="full">
      <DisplayMonitors />
      <DisplayVideos />
      <HStack>
        <Text>새로운 동영상이 있으세요?</Text>
        <Button as={Link} to="/display/upload">
          업로드하러가기
        </Button>
      </HStack>
    </VStack>
  );
};

export default Display;
