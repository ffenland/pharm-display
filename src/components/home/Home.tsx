import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../libs/useAuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const {
    authState: { user },
  } = useAuthContext();
  const [keyCode, setKeyCode] = useState("");
  useEffect(() => {
    if (user && user.keyCode) {
      setKeyCode(user.keyCode);
    }
  }, [user]);

  return (
    <VStack bg={"pink.50"} py={"10"} rounded={"lg"}>
      <HStack bg={"pink.100"} p={4} rounded={"lg"}>
        {user ? (
          <>
            <Text>당신의 keyCode는 </Text>
            <Text color="red.500" fontWeight={"bold"}>
              {user.keyCode}
            </Text>
            <Text>입니다.</Text>
          </>
        ) : keyCode ? (
          <>
            <Text>당신의 keyCode는 </Text>
            <Text color="red.500" fontWeight={"bold"}>
              {keyCode}
            </Text>
            <Text>입니다.</Text>
          </>
        ) : (
          <Text>로그인해서 KeyCode를 확인하세요.</Text>
        )}
      </HStack>
      {user ? (
        <Box
          rounded={"md"}
          px={"4"}
          py={"4"}
          _hover={{ bgColor: "gray.200" }}
          mt={"4"}
          cursor={"pointer"}
          bgColor={"white"}
          shadow={"lg"}
          as={Link}
          to="/display"
        >
          <Text>관리자 페이지로 가기</Text>
        </Box>
      ) : null}
      <Box
        rounded={"md"}
        px={"4"}
        py={"4"}
        _hover={{ bgColor: "gray.200" }}
        mt={"4"}
        cursor={"pointer"}
        bgColor={"white"}
        shadow={"lg"}
        as={Link}
        to="/monitor"
      >
        <Text>모니터 페이지로 가기</Text>
      </Box>
    </VStack>
  );
};

export default Home;
