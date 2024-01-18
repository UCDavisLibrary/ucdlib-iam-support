import { html } from 'lit';

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
  return html`  
  <div class='l-container u-space-mt--large'>
    <div class="l-3col">
      <div class='l-first'>
        <div class='o-box u-space-mb'>
          <a href="/onboarding" class="marketing-highlight category-brand--rec-pool">
            <div class="marketing-highlight__image">
              <img src="/img/LibraryGroup-Egghead.png" alt="4x3 Image" width="640" height="480" loading="lazy" />
              <h3 class="marketing-highlight__type"><span><i class='fas fa-user-plus unskew'></i></span></h3>
            </div>
            <div class="marketing-highlight__body">
              <h3 class="marketing-highlight__title">Employee Onboarding</h3>
              <p><label>HR</label>Submit requests to add people to the Library's employee database.</p>
              <p><label>Supervisors</label>View the status of submitted onboarding requests for your direct reports.</p>
              <span class="marketing-highlight__cta">Onboard</span>
            </div>
          </a>
        </div>
      </div>
      <div class='l-second'>
        <div class='o-box u-space-mb'>
          <a href="/separation" class="marketing-highlight category-brand--sage">
            <div class="marketing-highlight__image">
              <img src="/img/shields-students-stairs.jpg" alt="4x3 Image" width="640" height="480" loading="lazy" />
              <h3 class="marketing-highlight__type"><span><i class='fas fa-user-minus unskew'></i></span></h3>
            </div>
            <div class="marketing-highlight__body">
              <h3 class="marketing-highlight__title">Employee Separation</h3>
              <p><label>HR</label>Submit requests to remove people from the Library's employee database.</p>
              <p><label>Supervisors</label>View the status of submitted separation requests for your direct reports.</p>
              <span class="marketing-highlight__cta">Separate</span>
            </div>
          </a>
        </div>
      </div>
      <div class='l-third'>
        <div class='o-box u-space-mb'>
          <a href="/permissions" class="marketing-highlight category-brand--sunflower">
            <div class="marketing-highlight__image">
              <img src="/img/laptop-hands.jpg" alt="4x3 Image" width="640" height="480" loading="lazy" />
              <h3 class="marketing-highlight__type"><span><i class='fas fa-lock unskew'></i></span></h3>
            </div>
            <div class="marketing-highlight__body">
              <h3 class="marketing-highlight__title">Permissions</h3>
              <p>Request permissions to library services and applications for yourself or another employee.</p>
              <span class="marketing-highlight__cta">Request</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>

`;}
