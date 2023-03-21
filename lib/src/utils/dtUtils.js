/**
 * @classdesc Utility class for datetime stuff
 */
export default class DtUtils {
  static fmtDatetime(d, dateOnly, UTC){
    d = new Date(d);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let out;
    if ( UTC ){
      out = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
    } else {
      out = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }
    if ( !dateOnly && !UTC ){
      out += ` ${d.toLocaleTimeString()}`;
    } else if ( !dateOnly && UTC) {
      out += `${d.toUTCString().split(" ")[4]}`
    }
    return out;
  }
}