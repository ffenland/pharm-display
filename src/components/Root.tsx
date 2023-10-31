import { Box, VStack } from "@chakra-ui/react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const Root = () => {
  return (
    <VStack w="full" h="100vh">
      <Header />
      <Box flex={1} w="full">
        <Outlet />
      </Box>
      <Footer />
    </VStack>
  );
};

export default Root;
