import styles from '../styles/Taskbar.module.scss';
import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import posed, { PoseGroup } from 'react-pose';
import Clock from './Clock';
import TaskbarEntry from './TaskbarEntry';

const PosedDiv = posed.div({
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      x: {
        type: 'spring'
      }
    }
  },
  exit: {
    opacity: 0,
    opacity: 0,
    transition: {
      duration: 300
    },
    x: -50
  }
});

export default function Taskbar() {
  const { apps = {} } = useContext(AppsContext);

  return (
    <div className={ styles.taskbar }>
      <div className={ styles.taskbar_entries }>
        <PoseGroup animateOnMount={ true }>
          { Object.entries(apps)
            .filter(([_id, app]) => app.opened)
            .map(([id, app]) => (
              <PosedDiv key={ id }>
                <TaskbarEntry icon={ app.icon } id={ id } name={ app.name } />
              </PosedDiv>
          )) }
        </PoseGroup>
      </div>
      <Clock hour12={ true } />
    </div>
  );
};
