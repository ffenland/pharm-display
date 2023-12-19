import React from "react";
import { IMonitorList } from "../../types/types";
import { Grid, GridItem, HStack, Text, VStack } from "@chakra-ui/react";

const DisplayMonitors = ({ monitorList }: { monitorList: IMonitorList }) => {
  const monitorIds = Object.keys(monitorList);

  return (
    <Grid templateColumns={"repeat(2, 1fr)"} gap={5} w="full">
      {monitorIds.map((id) => {
        const monitor = monitorList[id];
        return (
          <GridItem
            key={id}
            border={"1px"}
            borderColor={"gray.100"}
            shadow={"lg"}
            rounded={"lg"}
            p={"5"}
          >
            <VStack>
              <HStack w="full">
                <Text>모니터ID : </Text>
                <Text>{id}</Text>
              </HStack>
              <HStack w="full">
                <Text>파일명 : </Text>
                <Text>{"fileName"}</Text>
              </HStack>
              <HStack w="full">
                <Text>재생정보 : </Text>
                <Text>{monitor.state}</Text>
              </HStack>
            </VStack>
          </GridItem>
        );
      })}
    </Grid>
  );
};

export default DisplayMonitors;
