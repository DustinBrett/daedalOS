import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import posed, { PoseGroup } from 'react-pose';
import { Window } from './Window';

const PosedDiv = posed.div({
  enter: {
    y: 0,
    opacity: 1,
    transition: {
      y: {
        damping: 15,
        stiffness: 800,
        type: 'spring'
      }
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 300
    },
    y: 50,
  }
});

export default function Windows() {
  const { apps = {} } = useContext(AppsContext);

  // Load windows delayed to show popup actions, 100 ms setTimeouts for each window entry, and pop in animations
  return (
    <PoseGroup animateOnMount={ true }>
      { Object.entries(apps)
          .filter(([_id, app]) => app.opened && !app.minimized)
          .map(([id, app]) => (
            <PosedDiv key={ id }>
              <Window app={ app } id={ id } title={ app.name }>
                { app.component }
              </Window>
            </PosedDiv>
          )) }
    </PoseGroup>
  );
};
