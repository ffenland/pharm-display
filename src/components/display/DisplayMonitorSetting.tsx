import { Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useSearchParams } from "react-router-dom";

const DisplayMonitorSetting = () => {
  const [searchParams] = useSearchParams();
  const monitorId = searchParams.get("id");
  console.log(monitorId);
  return (
    <VStack w="full" bgColor={"pink.50"}>
      <Text>{monitorId}</Text>
    </VStack>
  );
};

export default DisplayMonitorSetting;
