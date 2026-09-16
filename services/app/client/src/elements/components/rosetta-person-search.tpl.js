import { html } from 'lit';

export function render() { 
return html`
  <div class='h4 u-space-mb' ?hidden=${this.noHeading}>${this.heading}</div>
  <div 
    id=${this.idGen.get('error')} 
    class='alert alert--error' 
    role="alert" 
    tabindex="-1"
    ?hidden=${!this.isError}>${this.errorMessage}</div>
  <div ?hidden=${this.showResults}>
    <form @submit=${this._onSubmit}>

      <div class='field-container'>
        <label for=${this.idGen.get('idType')}>Search By</label>
        <select id=${this.idGen.get('idType')} .value=${this.query.idType || ''} @change=${e => this._onInputChange('idType', e.target.value)}>
          <option value=''>-- Select an option --</option>
          ${this.idTypes.map( type => html`<option value=${type.id}>${type.label}</option>` )}
        </select>
      </div>
      <div class='field-container' ?hidden=${this.query.idType === 'name'}>
        <label for=${this.idGen.get('id')}>Identifier</label>
        <input id=${this.idGen.get('id')} type='text' .value=${this.query.id || ''} @input=${e => this._onInputChange('id', e.target.value)} />
      </div>
      <div ?hidden=${this.query.idType !== 'name'}>
        <div class='field-container'>
          <label for=${this.idGen.get('firstName')}>First Name</label>
          <input id=${this.idGen.get('firstName')} type='text' .value=${this.query.firstName || ''} @input=${e => this._onInputChange('firstName', e.target.value)} />
        </div>
        <div class='field-container'>
          <label for=${this.idGen.get('lastName')}>Last Name</label>
          <input id=${this.idGen.get('lastName')} type='text' .value=${this.query.lastName || ''} @input=${e => this._onInputChange('lastName', e.target.value)} />
        </div>
        <div class='field-container checkbox'>
          <input id=${this.idGen.get('partial')} type='checkbox' .checked=${this.query.partial || false} @input=${() => this._onInputChange('partial', !this.query.partial)} />
          <label for=${this.idGen.get('partial')}>Return Partial Name Matches</label>
        </div>
      </div>
      <button type="submit" class='btn btn--primary btn--block' ?disabled=${this.isSearching}>Search</button>
    </form>
  </div>
  <div ?hidden=${!this.showResults}>
    <div role='status' class='u-space-pb'>${this.totalResults} ${this.totalResults === 1 ? 'person' : 'people'} found</div>
    <div class='rosetta-person-results'>
      <ul>
        ${this.results.map( person => html`
          <li>
            <button 
              type='button' 
              aria-pressed=${this.selected?.id === person.id}
              class='rosetta-person-results__item ${this.selected?.id === person.id ? 'rosetta-person-results__item--selected' : ''}'
              @click=${() => this._onPersonClick(person)}>
              <span class='name'>${person.fullName}</span>
              <span class='association'>${person.primaryAssociationLabel}</span>
              <span class='association'>${person.studentAssociationLabel}</span>
              <span class='association'>${person.isHealthAffiliate ? 'Health Affiliate' : ''}</span>
              <span class='association'>${person.ucanrAffiliation ? 'UC ANR Affiliate' : ''}</span>
              <span class='association'>${person.isTemporaryAffiliate ? 'Temporary Affiliate' : ''}</span>
            </button>
          </li>
          ` )}
      </ul>

      <div ?hidden=${this.totalResults == this.results.length} class='more-results'>Please refine your search to view more results.</div>
    </div>
    
    <button type="button" class='btn btn--block' @click=${this._onNewSearchClick}>New Search</button>
  </div>
`;}