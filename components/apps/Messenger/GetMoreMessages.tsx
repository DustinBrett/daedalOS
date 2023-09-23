import { useState } from "react";
import Button from "styles/common/Button";
import { MILLISECONDS_IN_DAY } from "utils/constants";
import StyledGetMoreMessages from "components/apps/Messenger/StyledGetMoreMessages";

type TimeScale = "day" | "week" | "month" | "trimester" | "infinite";

const TimeScaleLabel: Partial<Record<TimeScale, string>> = {
  day: "Retrieve last 7 days of messages",
  month: "Retrieve last 90 days of messages",
  trimester: "Retrieve all messages",
  week: "Retrieve last 30 days of messages",
};

const GetMoreMessages: FC<{
  setSince: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setSince }) => {
  const [timeScale, setTimeScale] = useState<TimeScale>("day");

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (timeScale === "infinite") return <></>;

  return (
    <StyledGetMoreMessages>
      <Button
        onClick={() => {
          switch (timeScale) {
            case "day":
              setSince(MILLISECONDS_IN_DAY * 7);
              setTimeScale("week");
              break;
            case "week":
              setSince(MILLISECONDS_IN_DAY * 30);
              setTimeScale("month");
              break;
            case "month":
              setSince(MILLISECONDS_IN_DAY * 90);
              setTimeScale("trimester");
              break;
            default:
              setSince(0);
              setTimeScale("infinite");
              break;
          }
        }}
      >
        {TimeScaleLabel[timeScale]}
      </Button>
    </StyledGetMoreMessages>
  );
};

export default GetMoreMessages;
