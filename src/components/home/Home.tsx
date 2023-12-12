import { Box, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Home = () => {
  // const [searchParams, setSearchParams] = useSearchParams();
  // const keyCode = searchParams.get("keyCode");

  const [keyCode, setKeyCode] = useState("");

  useEffect(() => {
    const savedKeyCode = localStorage.getItem("keyCode");
    if (savedKeyCode) {
      setKeyCode(savedKeyCode);
    }
  }, []);

  return (
    <VStack>
      <Box>
        <Text>{keyCode ? keyCode : "You need to set KeyCode"}</Text>
      </Box>
    </VStack>
  );
};

export default Home;
