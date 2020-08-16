import 'jquery';
import clippyjs from '../assets/lib/clippyjs';

import { createContext, useEffect, useState } from 'react';

// TODO: Control agent.mute() from systray audio icon

const agentName = 'Merlin';
const agentDataPath = './agents/';
const agentDimensions = { width: 128, height: 128 };
const agentPadding = 30;
const taskbarHeight = 28; // TODO: Import from CSS

export const AgentContext = createContext(null);

export const AgentProvider = props => {
  const [agent, setAgent] = useState(),
    updateAgent = agent => {
      const { _el: [agentElement] } = agent;

      agentElement.addEventListener('dblclick', () => {
        agent.speak(`Hi! I'm ${ agentName } and I'll help you navigate this website.`);
        agent.animate();
      });

      setAgent(agent);
      agent.show(
        window.innerWidth - agentDimensions.width - agentPadding,
        window.innerHeight - agentDimensions.height - agentPadding - taskbarHeight
      );
    };

  useEffect(() => clippyjs.load(agentName, updateAgent, undefined, agentDataPath), []);

  return <AgentContext.Provider value={{ agent }} {...props} />;
};
