import { Button, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { login } from "../firebase/firebase";

const Header = () => {
  return (
    <HStack w="full" justifyContent={"space-between"}>
      <Text>Logo</Text>
      <HStack>
        <Button onClick={login}>Login</Button>
      </HStack>
    </HStack>
  );
};

export default Header;
