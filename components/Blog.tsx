import { useEffect, useContext } from "react";
import { AgentContext } from "./Agent";

export default function Blog() {
  const { agent } = useContext(AgentContext);

  useEffect(() => agent?.play('Read'), []);

  return (
    <div>
      <img src='/blog.png'/>
    </div>
  );
};
