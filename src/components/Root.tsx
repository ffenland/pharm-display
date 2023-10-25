import { Box, VStack } from "@chakra-ui/react";
import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const Root = () => {
  return (
    <VStack w="full" h="100vh">
      <Header />
      <Box flex={1}>
        <Outlet />
      </Box>
      <Footer />
    </VStack>
  );
};

export default Root;
