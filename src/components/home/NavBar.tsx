import { HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <HStack as="header">
      <Link to="/">Home</Link>
    </HStack>
  );
};

export default NavBar;
