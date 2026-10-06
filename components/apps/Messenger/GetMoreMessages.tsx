import { useState } from "react";
import {
  type TimeScale,
  useHistoryContext,
} from "components/apps/Messenger/HistoryContext";
import StyledListButton from "components/apps/Messenger/StyledListButton";
import Button from "styles/common/Button";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

const NEXT_TIME_SCALE: Partial<Record<TimeScale, [TimeScale, string]>> = {
  month: ["trimester", "Retrieve last 90 days of messages"],
  trimester: ["infinite", "Retrieve all messages"],
  week: ["month", "Retrieve last 30 days of messages"],
};

const GetMoreMessages: FC = () => {
  const { setTimeScale, timeScale } = useHistoryContext();
  const [disabled, setDisabled] = useState<boolean>(false);
  const nextTimeScale = NEXT_TIME_SCALE[timeScale];

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!nextTimeScale) return <></>;

  const [scale, label] = nextTimeScale;

  return (
    <StyledListButton>
      <Button
        disabled={disabled}
        onClick={() => {
          setTimeScale(scale);
          setDisabled(true);
          setTimeout(() => setDisabled(false), MILLISECONDS_IN_SECOND);
        }}
      >
        {label}
      </Button>
    </StyledListButton>
  );
};

export default GetMoreMessages;
