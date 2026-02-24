import {PayloadUtils} from '@ucd-lib/cork-app-utils'

const ID_ORDER = ['entityId', 'name', 'idType', 'lastName', 'firstName'];

let inst = new PayloadUtils({
  idParts: ID_ORDER
});

export default inst;