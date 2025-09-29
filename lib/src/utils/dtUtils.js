/**
 * @classdesc Utility class for datetime stuff
 */
export default class DtUtils {

  /**
   * @description Formats a datetime string into a human readable format that we prefer
   * @param {Date} d - Date object
   * @param {Object} options - Date formatting options, currently supports:
   * - dateOnly: Boolean - if true, will only return the date portion
   * - UTC: Boolean - if true, will return UTC time
   * - includeDayOfWeek: Boolean - if true, will include the day of the week
   * @returns
   */
  static fmtDatetime(d, options={}){
    const {dateOnly, UTC, includeDayOfWeek} = options;
    d = new Date(d);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = UTC ? days[d.getUTCDay()] : days[d.getDay()];
    let out;
    if ( UTC ){
      out = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
    } else {
      out = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }
    if ( includeDayOfWeek ){
      out = `${day}, ${out}`;
    }
    if ( !dateOnly && !UTC ){
      out += ` ${d.toLocaleTimeString()}`;
    } else if ( !dateOnly && UTC) {
      out += `${d.toUTCString().split(" ")[4]}`
    }
    return out;
  }


  /**
   * @description format LDAP date string to readable format
   * @param {String} dateString - LDAP date string
   * @returns {String} - formatted date string
   */
  static formatLDAPDate(dateString) {
      if (!dateString) return '';
      try {
        const noFractionsDate = dateString.replace(/[.,]\d+/, "");
        const isoDate = noFractionsDate.replace(
          /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/,
          "$1-$2-$3T$4:$5:$6Z"
        );
        return new Intl.DateTimeFormat("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false, timeZone: "UTC"
        }).format(new Date(isoDate));    
      }
      catch (e) {
        console.error('formatLDAPDate error:', e, dateString);
        return '';
  
      }
  
    }
}
