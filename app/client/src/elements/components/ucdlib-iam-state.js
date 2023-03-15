import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-iam-state.tpl.js";
import {MutationObserverController} from "@ucd-lib/theme-elements/utils/controllers";

/**
 * @description Component class for displaying a loading or error state
 */
export default class UcdlibIamState extends LitElement {

  static get properties() {
    return {
      state: {type: String},
      errorMessage: {type: String, attribute: 'error-message'},
      isVisible: {state: true}
    };
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.state = 'loading';
    this.errorMessage = '';

    this.isVisible = false;
    new MutationObserverController(this, {attributes : true, attributeFilter : ['style']});

  }

  /**
   * @description Lit lifecycle method
   * @param {*} props 
   */
  willUpdate(props){
    if ( props.has('state') ){
      if ( !['error', 'loading'].includes(this.state)){
        this.state = 'loading';
      }
    }
  }

  /**
   * @description Fires when style changes
   * Delays showing loading screen, so we don't get a jarring flash of content for quick loads
   */
  _onChildListMutation(){
    setTimeout(() => {
      this.isVisible = this.style.display != 'none';
    }, 10);
  }

}

customElements.define('ucdlib-iam-state', UcdlibIamState);