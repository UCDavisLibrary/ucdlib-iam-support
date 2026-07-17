import { html } from 'lit';

export function render() {
  return html`

  <div class='l-container u-space-mb--large'>
    <div class='l-content'>
      <div class='l-shrink u-width--100-in-tablet'>
        <p>Emails are sent to supervisors of new employees at specified intervals after start/hire date, reminding them about onboarding tasks (in the form of checklists) that should be completed. </p>

        <div class="field-container">
          <label for="obr-from-email">From Email Address</label>
          <input
            id="obr-from-email"
            type="email"
            .value=${this.settings.fromEmail}
            @input=${this._onFromEmailInput}>
        </div>

        <div class="obr-grid">
          <div class="obr-grid__header">Interval</div>
          <div class="obr-grid__header">Disabled</div>
          <div class="obr-grid__header">Checklist Name</div>
          <div class="obr-grid__header">Checklist Link</div>

          ${this.intervals.map(interval => {
            const row = this.settings.intervals[interval.slug] || {disabled: false, checklistName: '', checklistLink: ''};
            const disabledId = `obr-${interval.slug}-disabled`;
            const nameId = `obr-${interval.slug}-checklist-name`;
            const linkId = `obr-${interval.slug}-checklist-link`;
            return html`
              <div class="obr-grid__cell obr-grid__cell--label">${interval.label}</div>
              <div class="obr-grid__cell">
                <label class="obr-grid__mobile-label" for=${disabledId}>Disabled</label>
                <input
                  id=${disabledId}
                  type="checkbox"
                  .checked=${row.disabled}
                  @change=${e => this._onIntervalFieldInput(interval.slug, 'disabled', e.target.checked)}>
              </div>
              <div class="obr-grid__cell">
                <label class="obr-grid__mobile-label" for=${nameId}>Checklist Name</label>
                <input
                  id=${nameId}
                  type="text"
                  .value=${row.checklistName}
                  @input=${e => this._onIntervalFieldInput(interval.slug, 'checklistName', e.target.value)}>
              </div>
              <div class="obr-grid__cell">
                <label class="obr-grid__mobile-label" for=${linkId}>Checklist Link</label>
                <input
                  id=${linkId}
                  type="url"
                  .value=${row.checklistLink}
                  @input=${e => this._onIntervalFieldInput(interval.slug, 'checklistLink', e.target.value)}>
              </div>
            `;
          })}
        </div>

        <button
          type='button'
          @click=${this._onSaveClicked}
          ?disabled=${this.saving}
          class="u-space-mt btn btn--block btn--alt">
          ${this.saving ? 'Saving...' : 'Save Settings'}
        </button>

      </div>
    </div>
  </div>

`;}
