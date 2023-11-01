import { Button, HStack, Text, useDisclosure } from "@chakra-ui/react";
import SignupModal from "./Auth/SignupModal";
import LoginModal from "./Auth/LoginModal";
import { useAuthContext } from "../libs/useAuthContext";

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
        <Text>Logo</Text>
        <HStack>
          {authState.user ? (
            <Button onClick={logout}>Logout</Button>
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
