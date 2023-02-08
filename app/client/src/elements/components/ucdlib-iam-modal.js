import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-iam-modal.tpl.js";

/**
 * @description Component class for displaying a modal with slotted content
 */
export default class UcdlibIamModal extends LitElement {

  static get properties() {
    return {
      visible: {type: Boolean},
      contentTitle: {type: String, attribute: "content-title"},
      dismissText: {type: String, attribute: 'dismiss-text'},
      closeOnConfirm : {type: Boolean}
    };
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.visible = false;
    this.contentTitle = "";
    this.dismissText = "Cancel";
    this.closeOnConfirm = true;
  }

  /**
   * @method show
   * @description Shows the modal.
   */
  show() {
    this.visible = true;
  }

  /**
   * @method hide
   * @description Hides the modal.
   */
  hide() {
    this.visible = false;
  }

  /**
   * @method toggle
   * @description Shows/hides the modal.
   */
  toggle() {
    this.visible = !this.visible;
  }

  /**
   * @method _onConfirmClicked
   * @description bound to click event on confirm slot.  Close modal
   * if this.closeOnConfirm is set to true.
   * 
   */
  _onConfirmClicked() {
    if( this.closeOnConfirm ) {
      this.hide();
    }
  }

}

customElements.define('ucdlib-iam-modal', UcdlibIamModal);