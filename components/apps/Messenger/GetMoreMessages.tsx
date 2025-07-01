import { memo, useState } from "react";
import {
  type TimeScale,
  useHistoryContext,
} from "components/apps/Messenger/HistoryContext";
import StyledGetMoreMessages from "components/apps/Messenger/StyledGetMoreMessages";
import Button from "styles/common/Button";
import { MILLISECONDS_IN_DAY, MILLISECONDS_IN_SECOND } from "utils/constants";

const TimeScaleLabel: Partial<Record<TimeScale, string>> = {
  day: "Retrieve last 7 days of messages",
  month: "Retrieve last 90 days of messages",
  trimester: "Retrieve all messages",
  week: "Retrieve last 30 days of messages",
};

const GetMoreMessages: FC<{
  setSince: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setSince }) => {
  const { timeScale, setTimeScale } = useHistoryContext();
  const [disabled, setDisabled] = useState<boolean>(false);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (timeScale === "infinite") return <></>;

  const updateTimeScale = (since: number, scale: TimeScale): void => {
    setSince(since);
    setTimeScale(scale);
    setDisabled(true);
    setTimeout(() => setDisabled(false), MILLISECONDS_IN_SECOND);
  };

  return (
    <StyledGetMoreMessages>
      <Button
        disabled={disabled}
        onClick={() => {
          switch (timeScale) {
            case "day":
              updateTimeScale(MILLISECONDS_IN_DAY * 7, "week");
              break;
            case "week":
              updateTimeScale(MILLISECONDS_IN_DAY * 30, "month");
              break;
            case "month":
              updateTimeScale(MILLISECONDS_IN_DAY * 90, "trimester");
              break;
            default:
              updateTimeScale(0, "infinite");
              break;
          }
        }}
      >
        {TimeScaleLabel[timeScale]}
      </Button>
    </StyledGetMoreMessages>
  );
};

export default memo(GetMoreMessages);
