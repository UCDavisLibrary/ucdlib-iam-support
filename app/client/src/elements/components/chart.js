import { LitElement } from 'lit';
import {render, styles} from "./chart.tpl.js";
import { OrgChart } from 'd3-org-chart';
import {json} from 'd3';

/**
 * @description Organizational Chart Render
 */
export default class D3Chart extends LitElement {

  static get properties() {
    return {
      src: { type: String, attribute: 'src' },
      csvData: {
        type: Array,
        attribute: 'csv-data',
        converter: {
          fromAttribute(value) {
            try {
              return JSON.parse(value); // Parse the JSON string into an array
            } catch (error) {
              console.error('Error parsing csv-data:', error);
              return [];
            }
          },
          toAttribute(value) {
            return JSON.stringify(value); // Serialize the array back to JSON
          }
        }
      }
    };
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.csvData = [];
    this.src = '';
    this.orgChart = null; // Reference to the OrgChart instance
  }

  /**
   * @description Runs the render options
   */
  runRender() {
    if (this.csvData.length !== 0) {
      this.renderOrgChart(this.csvData);
    } else if (this.src !== ''){
      json(this.src)
        .then((data) => {
          this.renderOrgChart(data);
        })
        .catch((error) => {
          console.error('Error loading JSON data:', error);
        });
    }
  }

  /**
   * @description On first update
   */
  firstUpdated(){
    // Initialize the org chart after the component has been rendered
    this.runRender(); 
  }

  /**
   * @description Update Properties
   * @param {Object} changedProperties changedProperties
   */
  updated(changedProperties){
    if (changedProperties.has('csvData')) {
      this.runRender();
    }
  }


  /**
   * @description Fit the Org Chart to Screen
   */
  fitOrg(){
    this.orgChart.expandAll().fit();
  }

  /**
   * @description Expand the Org Chart
   */
  expandOrg(){
    this.orgChart.expandAll().fit();
  }
  /**
   * @description Collapse the Org Chart
   */
  collapseOrg(){
    this.orgChart.collapseAll().fit();
  }

  /**
   * @description Zoom Out the Org Chart
   */
  zoomOut(){
    this.orgChart.zoomOut();
  }

  /**
   * @description Zoom In the Org Chart
   */
  zoomIn(){
    this.orgChart.zoomIn();
  }

  /**
   * @description Render org chart 
   * @param {Object} jsonData org json data
   */
  renderOrgChart(jsonData) {
    const container = this.renderRoot.querySelector('.chart-container');

    if (!this.orgChart) {
      this.orgChart = new OrgChart();
    }

    /**
     * @description Render org chart 
     * @param {Object} item
     * @returns 
     */
    function assignColorToTopLevel(item){

      // Assign the found color to the original item
      const color = findColor(item);
      if (color) {
        item.color = color;
      }
      return item;
    }
  
    /**
     * @description Render org chart 
     * @param {Node} node
     * @returns 
    */
    function findColor(node){
      // Recursive function to find the color in the hierarchy
      if (node.color) {
        return node.color;
      }
      if (node.parent) {
        return findColor(node.parent);
      }
      return null; // No color found
    }
  
    // Bind the org chart to the container
    this.orgChart
      .container(container)
      .data(jsonData)
      .rootMargin(100)
      .nodeWidth(() => 250)
      .nodeHeight(() => 80)
      .childrenMargin(() => 85)
      .compactMarginBetween(() => 75)

      .setActiveNodeCentered(true)
      .compactMarginPair(() => 80)
      .buttonContent(({ node }) => {
        return `<div style="border-radius:3px;padding:8px;font-size:10px;margin:auto auto;color:white;background-color:${node.color}"> <span style="font-size:9px">${
          node.children
            ? `<i class="fas fa-chevron-up"></i>`
            : `<i class="fas fa-chevron-down"></i>`
        }</span> ${node.data._directSubordinates}  </div>`;
      })
      .nodeContent(function (d) {

        const departmentColor = 
          {
            "Online Strategy" : '#00b2e3',
            "Research and Learning": '#00524c',
            "Scholarly Resources": '#f18a00',
            "Library External Relations": '#79242f',
            "DataLab": '#76236c',
            "Library Finance and Administration": '#3dae2b',
            "Office of the University Librarian": '#c10230'
          };


        if(d.depth == 0){
          d.color = '#c10230';
        }
        else if(d.depth == 1) {
          d.color = departmentColor[d.data.departmentName];          
        } else {
          assignColorToTopLevel(d);
        }

  
        return `
                  <div style="background-color:white; position:absolute;width:${d.width}px;height:${d.height}px;">
  
                        <div style="position:absolute;top:-20px;width:${d.width}px;text-align:center;color:#fafafa;">
                              <div style="margin:0 auto;background-color:${d.color};display:inline-block;padding:8px;padding-bottom:0px;border-radius:5px"> ${d.data.departmentName}</div>
                        </div>
                        <div style="background-color:${d.color};height:fit-content;text-align:center;padding:12px;color:#ffffff;font-weight:bold;font-size:16px;border-radius:15px;">
                            <span>${d.data.fullName}<span><br />
                            <span style="font-size:12px;">${d.data.title}</span>
                        </div>
                     </div>
                 </div>
          `;
      }).render();
  }

}

customElements.define('d3-chart', D3Chart);