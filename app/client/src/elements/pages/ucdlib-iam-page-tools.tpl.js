import { html } from 'lit';


export function render() {
  return html`

  <div class='l-container'>
    <div class='l-content'>
      <div class='l-shrink u-width--100-in-tablet'>
        <section class='media-links u-space-mb o-box'>
          <a href="/patron" class="media-link">
            <div class="media-link__figure" style="max-width:135px;width:25%;">
                <div class="aspect--1x1 u-background-image" style="background-image:url(/img/search-laptop-magnifyingglass_thumbnail-135x135.jpg)"></div>
            </div>
            <div class="media-link__body">
              <h3 class="media-link__title">Patron Lookup</h3>
              <p>Lookup Alma and UC Davis Identity Management records of UC Davis affiliates.</p>
            </div>
          </a>
        </section>
        <section class='media-links u-space-mb o-box'>
          <a href="/orgchart" class="media-link">
            <div class="media-link__figure" style="max-width:135px;width:25%;">
                <div class="aspect--1x1 u-background-image" style="background-image:url(/img/search-laptop-magnifyingglass_thumbnail-135x135.jpg)"></div>
            </div>
            <div class="media-link__body">
              <h3 class="media-link__title">Organizational Chart</h3>
              <p>Create a organizational data sheet from records in the UC Davis Identity Management records.</p>
            </div>
          </a>
        </section>
        <section class='media-links u-space-mb o-box'>
          <a href="/emupdate" class="media-link">
            <div class="media-link__figure" style="max-width:135px;width:25%;">
                <div class="aspect--1x1 u-background-image" style="background-image:url(/img/search-laptop-magnifyingglass_thumbnail-135x135.jpg)"></div>
            </div>
            <div class="media-link__body">
              <h3 class="media-link__title">Employee Update Tool</h3>
              <p>Update employee information by searching up employee and changing meta properties.</p>
            </div>
          </a>
        </section>
      </div>

    </div>
  </div>

`;}
