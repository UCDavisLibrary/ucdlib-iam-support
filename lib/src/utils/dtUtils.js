/**
 * @classdesc Utility class for datetime stuff
 */
export default class DtUtils {
  static fmtDatetime(d){
    d = new Date(d);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${d.toLocaleTimeString()}`;
  }
}