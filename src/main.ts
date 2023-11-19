import "./style.css";
import typescriptLogo from "./typescript.svg";
import { setupCounter } from "./counter";
import { start } from "./sequencer";
import "./scene";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div class="card">
      <button id="start" type="button">Start</button>
    </div>
  </div>
`;

document.querySelector<HTMLButtonElement>("#start")!.onclick = () => {
  start();
};
