import { LitElement } from 'lit';
import { render } from "./rosetta-person-search.tpl.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js"

export default class RosettaPersonSearch extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('rosetta-person-search', RosettaPersonSearch);