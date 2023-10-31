import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useAuthContext } from "../../libs/useAuthContext";

const LoginModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen?: () => void;
  onClose: () => void;
}) => {
  const { authState, login } = useAuthContext();
  useEffect(() => {
    if (authState.user) {
      onClose();
    }
  }, [authState.user, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Welcom back!</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <VStack as="form">
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" required />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" required />
              </FormControl>
              <Button type="submit">Login With Email/Password</Button>
            </VStack>
            <Divider />
            <Text>OR</Text>
            <Button onClick={login.googleLogin}>Login With Google</Button>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
