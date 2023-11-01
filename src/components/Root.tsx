import { Box, VStack } from "@chakra-ui/react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const Root = () => {
  return (
    <VStack maxW={"lg"} h="100vh" mx="auto">
      <Header />
      <Box flex={1} w="full" p={1}>
        <Outlet />
      </Box>
      <Footer />
    </VStack>
  );
};

export default Root;
