import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-iam-load.tpl.js";

export default class UcdlibIamLoad extends LitElement {

  static get properties() {
    return {
      
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('ucdlib-iam-load', UcdlibIamLoad);