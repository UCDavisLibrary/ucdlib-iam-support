import pg from "./pg.js";

/**
 * @description Manages pg data for onboarding form
 */
class getByName{
  constructor(type) {
    this.type = type;
  }

   /**
   * @description Retrieve an onboarding request by its name
   * @param {String} first - first name
   * @param {String} last - last name
   */
    async getByName(first, last){
      let where = [];
      const params = [];
      let text;
      if(this.type == "onboarding"){
        text = `
        SELECT r.*, sc.name as status_name, sc.is_open as is_active_status, sc.description as status_description
        FROM
          onboarding_requests r
        left join status_codes sc on sc.id = r.status_id
        `;
      } else if (this.type == "separation"){
        text = `
        SELECT r.*
        FROM
          separation_requests r
        `;
  
      }


      if(first){
        let w = `r.additional_data->>'employeeFirstName' ILIKE $${params.length + 1}`;
        where.push(w);
        params.push('%' + first + '%');
      }
      if(last){
        let w = `r.additional_data->>'employeeLastName' ILIKE $${params.length + 1}`;
        where.push(w);
        params.push('%' + last + '%');
      }
      if ( !where.length ) {
        return pg.returnError('no valid parameters');
      }

      let texts = text + `WHERE ` +  where.join(' AND ');
      return await pg.query(texts, params);
    }

}

export default new getByName();
