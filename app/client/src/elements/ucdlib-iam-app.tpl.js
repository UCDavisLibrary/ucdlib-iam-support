import { html } from 'lit';

/**
 * @description Template to be rendered
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <ucd-theme-header>
    <ucdlib-branding-bar slogan='Identity and Access Management'>
      <a href='/logout'>Logout</a>
    </ucdlib-branding-bar>
    <ucd-theme-primary-nav>
      <ul link-text='Onboarding' href='/onboarding'>
        <li><a href='/onboarding/new#lookup'>From UC Davis Directory</a></li>
        <li><a href='/onboarding/new#manual'>Manual Entry</a></li>
        <li><a href='/onboarding/new#transfer'>Transfer from Another Library Unit</a></li>
      </ul>
      <ul link-text='Separation' href='/separation'>
        <li><a href='/separation/new'>New Request</a></li>
      </ul>
      <a href='/permissions'>Permissions</a>
      <ul link-text='Support Tools' href='/supportTools'>
        <li><a href='/supportTools/orgChart'>Organizational Chart</a></li>
        <li><a href='/supportTools/patronLookup'>Patron Lookup Tool</a></li>

      </ul>
    </ucd-theme-primary-nav>
  </ucd-theme-header>
  <ucdlib-iam-alert></ucdlib-iam-alert>

  <section .hidden=${this.page == 'loading' || !this.showPageTitle}>
    <h1 class="page-title">${this.pageTitle}</h1>
  </section>
  <ol class="breadcrumbs" ?hidden=${this.page == 'loading' || !this.showBreadcrumbs}>
    ${this.breadcrumbs.map((b, i) => html`
      <li>
      ${i == this.breadcrumbs.length - 1 ? html`<span>${b.text}</span>` : html`<a href=${b.link}>${b.text}</a>`}
      </li>
    `)}
  </ol>

  <ucdlib-pages id='main-pages' selected=${this.page}>
    <ucdlib-iam-state id='loading' state=${this.status} error-message=${this.errorMessage}></ucdlib-iam-state>
    <ucdlib-iam-page-onboarding id='onboarding'></ucdlib-iam-page-onboarding>
    <ucdlib-iam-page-onboarding-new id='onboarding-new'></ucdlib-iam-page-onboarding-new>
    <ucdlib-iam-page-onboarding-single id='onboarding-single'></ucdlib-iam-page-onboarding-single>
    <ucdlib-iam-page-home id='home'></ucdlib-iam-page-home>
    <ucdlib-iam-page-separation id='separation'></ucdlib-iam-page-separation>
    <ucdlib-iam-page-separation-new id='separation-new'></ucdlib-iam-page-separation-new>
    <ucdlib-iam-page-separation-single id='separation-single'></ucdlib-iam-page-separation-single>
    <ucdlib-iam-page-permissions-single id='permissions-single'></ucdlib-iam-page-permissions-single>
    <ucdlib-iam-page-permissions id='permissions'></ucdlib-iam-page-permissions>
  </ucdlib-pages>
`;}
