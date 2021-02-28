import StyledTaskbarEntry from 'styles/components/system/Taskbar/StyledTaskbarEntry';

type TaskbarEntryProps = {
  icon: string;
  title: string;
};

const TaskbarEntry = ({ icon, title }: TaskbarEntryProps): JSX.Element => (
  <StyledTaskbarEntry>
    <figure>
      <img src={icon} alt={title} />
      <figcaption>{title}</figcaption>
    </figure>
  </StyledTaskbarEntry>
);

export default TaskbarEntry;
