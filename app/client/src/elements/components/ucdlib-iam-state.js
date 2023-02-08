import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-iam-state.tpl.js";

/**
 * @description Component class for displaying a loading or error state
 */
export default class UcdlibIamState extends LitElement {

  static get properties() {
    return {
      state: {type: String}
    };
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.state = 'loading';
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

}

customElements.define('ucdlib-iam-state', UcdlibIamState);