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
import { googleLogin } from "../../firebase/firebase";

const SignupModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen?: () => void;
  onClose: () => void;
}) => {
  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
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
            <Button onClick={handleGoogleLogin}>Signin With Google</Button>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost">Secondary Action</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;
