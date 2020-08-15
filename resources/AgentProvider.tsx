import 'jquery';
import clippyjs from 'clippyjs';
// Host agent data locally, not git // https://www.npmjs.com/package/clippyjs#custom-cdn--agents
// Load agent more close to bottom right corner
// How to dynamically change agent?
// Float mute above his head on hover which can mute/unmute the noises

import { createContext, useEffect, useState } from 'react';

const agentName = 'Merlin';

export const AgentContext = createContext(null);

export const AgentProvider = props => {
  const [agent, setAgent] = useState(),
    loadAgent = agentToLoad => () => clippyjs.load(agentToLoad, loadedAgent => {
      loadedAgent.show();
      setAgent(loadedAgent);
    });

  useEffect(loadAgent(agentName), []);

  return <AgentContext.Provider value={{ agent }} {...props} />;
};
