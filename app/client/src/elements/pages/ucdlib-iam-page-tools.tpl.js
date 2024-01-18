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
      </div>

    </div>
  </div>

`;}
