import util from 'util';
import { printTable } from 'console-table-printer';

class UtilsCli{

  logObject(data){
    console.log(util.inspect(data, { showHidden: false, depth: null, colors: true }));
  }

  printTable(data, columns) {
    if ( columns ){
      printTable(data.map(r => {return columns.reduce((acc, col) => {acc[col] = r[col]; return acc;}, {})}));
    } else {
      printTable(data);
    }

  }
}

export default new UtilsCli();
