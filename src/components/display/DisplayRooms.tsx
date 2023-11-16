import { Text, VStack } from "@chakra-ui/react";
import React, { useState } from "react";

const DisplayRooms = () => {
  const [groups, setGroups] = useState<{ id: string }[]>();
  return (
    <VStack>
      <Text>생성된 display 그룹</Text>
    </VStack>
  );
};

export default DisplayRooms;
