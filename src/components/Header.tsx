import { Button, HStack, Text, useDisclosure } from "@chakra-ui/react";
import SignupModal from "./Auth/SignupModal";
import LoginModal from "./Auth/LoginModal";
import { useAuthContext } from "../libs/useAuthContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: loginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  const { authState, logout } = useAuthContext();
  return (
    <>
      <HStack w="full" justifyContent={"space-between"}>
        <Text as={Link} to={"/"}>
          메인페이지로
        </Text>
        <HStack>
          {authState.user ? (
            <>
              <HStack rounded={"md"} bgColor={"gray.100"} py={"2"} px={"3"}>
                <Text>Key Code : </Text>
                <Text>{authState.user.keyCode}</Text>
              </HStack>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button onClick={onLoginOpen}>Login</Button>
              <Button onClick={onOpen}>SignUp</Button>
            </>
          )}
        </HStack>
      </HStack>
      <LoginModal isOpen={loginOpen} onClose={onLoginClose} />
      <SignupModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Header;
