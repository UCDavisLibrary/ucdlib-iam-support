import { html, css, svg } from 'lit';
import headingStyles from "@ucd-lib/theme-sass/1_base_html/_headings.css";
import headingClassesStyles from "@ucd-lib/theme-sass/2_base_class/_headings.css";

/**
 * @description Element styles
 * @returns 
 */
export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
    [hidden] {
      display: none !important;
    }
    .main {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      margin-top: 1rem;
    }
    .logo {
      width: 30%;
      max-width: 150px;
    }
    .logo-error {
      color: #c10230;
    }
    .lib-logo {
      transform: scale(2.0);
      animation-name: swell;
      animation-duration: 2.0s;
      animation-timing-function: ease-out;
      animation-direction: alternate;
      animation-iteration-count: infinite;
      animation-play-state: running;
    }

    .text {
      margin-top: .5rem;
    }
    .error .text {
      text-align: center;
    }

    @keyframes swell {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(.9);
      }
    }
    .dot {
      opacity: 0;
      animation: showHideDot 2.5s ease-in-out infinite;
    }
    .dot.one { animation-delay: 0.2s; }
    .dot.two { animation-delay: 0.4s; }
    .dot.three { animation-delay: 0.6s; }
    @keyframes showHideDot {
      0% { opacity: 0; }
      50% { opacity: 1; }
      60% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;

  return [
    headingStyles,
    headingClassesStyles,
    elementStyles];
}

/**
 * @description UCD Library book logo
 * @returns 
 */
function renderLogo() {
  return svg`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 276.31 432.01"><path d="M102.37,337.79,148,325.38c13.66-3.71,24-17.44,24-31.94V121.15l-69.56-11Z" style="fill:#ffbf00"/><path d="M171.94,87.9V0L24.87,31.15C10.69,34.15,0,47.81,0,63v302.7l69.55-18.93v-275Z" style="fill:#ffbf00"/><path d="M250.56,100.25,171.94,87.9v33.26l71.49,11.24V393.6l-141-22.18V337.8l-32.84,8.94v25.48c0,15.3,11.3,29.06,25.72,31.33l181,28.46V131.58C276.27,116.28,265,102.52,250.56,100.25Z" style="fill:#022851"/></svg>
  `;
}

function renderErrorLogo(){
  return svg`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"/></svg>
  `;
}

/**
 * @description main render function
 * @returns 
 */
export function render() { 
  return html`
  <div class='loading main' ?hidden=${this.state != 'loading'}>
    <div class='logo lib-logo'>${renderLogo()}</div>
    <h1 class='text heading--highlight'>
      <span>Loading</span><span class="loading-dots"><span class="dot one">.</span><span class="dot two">.</span><span class="dot three">.</span></span>
    </h1>
  </div>
  <div class='error main' ?hidden=${this.state != 'error'}>
    <div class='logo logo-error'>${renderErrorLogo()}</div>
    <h1 class='text heading--highlight'> An ${this.errorMessage ? '' : 'unknown'} error has occurred!</h1>
    <h1 class='text heading--highlight' .hidden=${this.errorMessage ? false : true}>${this.errorMessage}</h1>
  </div>
  

`;}