import "./style.css";
import { start } from "./sequencer";
import "./scene";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="controls">
      <button id="start" type="button">Start</button>
  </div>
`;

document.querySelector<HTMLButtonElement>("#start")!.onclick = () => {
  start();
};
