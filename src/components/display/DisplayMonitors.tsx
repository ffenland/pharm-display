import { useEffect, useState } from "react";
import { IMonitorsInfo } from "../../types/types";
import { Box, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import { useAuthContext } from "../../libs/useAuthContext";
import { listenMonitorInfo } from "../../firebase/firebase";
import { Link } from "react-router-dom";

const MonitorGrid = ({ monitors }: { monitors: IMonitorsInfo }) => {
  const monitorKeys = Object.keys(monitors);

  return (
    <Grid templateColumns={"repeat(2, 1fr)"} gap={5} w="full">
      {monitorKeys.map((key) => {
        return (
          <GridItem
            w="full"
            key={key}
            shadow={"md"}
            borderRadius={"md"}
            p={"4"}
            bgColor={"teal.50"}
            cursor={"pointer"}
            as={Link}
            to={`/display/monitor-setting?id=${key}`}
          >
            <HStack w="full">
              <Text>아이디 : </Text>
              <Text>{key}</Text>
            </HStack>
          </GridItem>
        );
      })}
    </Grid>
  );
};

const DisplayMonitors = () => {
  const {
    authState: { user },
  } = useAuthContext();

  const [monitors, setMonitors] = useState<IMonitorsInfo>();
  useEffect(() => {
    if (user) {
      //get monitor info
      const keyCode = user.keyCode;
      const callback = (monitors: IMonitorsInfo) => {
        setMonitors(monitors);
      };
      listenMonitorInfo({ keyCode, callback });
    }
  }, [user]);

  return (
    <Box w="full" p={"4"} shadow={"md"} rounded={"md"}>
      <Box mb={"3"}>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          모니터 목록
        </Text>
      </Box>
      {monitors ? (
        <MonitorGrid monitors={monitors} />
      ) : (
        <Text>하나도 없네요.</Text>
      )}
    </Box>
  );
};

export default DisplayMonitors;
