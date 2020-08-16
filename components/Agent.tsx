import 'jquery';
import clippyjs from '../assets/lib/clippyjs';

import styles from '../styles/Agent.module.scss';

import { createContext, useEffect, useState, useRef, useContext } from 'react';

// TODO: Control agent.mute() from systray audio icon
// TODO: Don't allow moving wizard?
// TODO: Clicking wizard shows ugly outline on mobile at least
// TODO: Shadow
// TODO: He should go behind windows
// TODO: Single click for actions on mobile (maybe desktop)

const agentName = 'Merlin';
const agentDataPath = './agents/';
const agentDimensions = { width: 128, height: 128 };
const agentPadding = 30;
const taskbarHeight = 28; // TODO: Import from CSS

export const AgentContext = createContext(null);

export const AgentProvider = props => {
  const [agent, setAgent] = useState();

  return <AgentContext.Provider value={{ agent, setAgent }} {...props} />;
};

export const Agent = ({ name: agentName = 'Merlin' }) => {
  const { agent, setAgent } = useContext(AgentContext),
    agentRef = useRef(),
    updateAgent = agent => {
      const { _el: [agentElement] } = agent,
        { current: agentContainerElement } = agentRef as { current: HTMLDivElement };

      agentContainerElement.appendChild(agentElement);

      setAgent(agent);

      agent.show({
        x: window.innerWidth - agentDimensions.width - agentPadding,
        y: window.innerHeight - agentDimensions.height - agentPadding - taskbarHeight
      });
    },
    onDblClick = () => {
      agent.speak(`Hi! I'm ${ agentName } and I'll help you navigate this website.`);
      agent.animate();
    };

  useEffect(() => clippyjs.load(agentName, updateAgent, undefined, agentDataPath), []);

  return (
    <div className={ styles.agent_container } ref={ agentRef } onDoubleClick={ onDblClick } />
  );
}
