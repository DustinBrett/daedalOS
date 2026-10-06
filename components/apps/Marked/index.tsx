import StyledMarked from "components/apps/Marked/StyledMarked";
import useMarked from "components/apps/Marked/useMarked";
import AppContainer, {
  useAppContainer,
} from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Marked: FC<ComponentProcessProps> = ({ id }) => {
  const containerProps = useAppContainer(id);

  useMarked(containerProps);

  return (
    <AppContainer {...containerProps} StyledComponent={StyledMarked}>
      <article />
    </AppContainer>
  );
};

export default Marked;
