import { Client } from 'ldapts';
import fs from 'fs/promises';

/**
 * @description Manages LDAP operations such as connecting, binding, 
 * searching, and filtering directory entries.
 */
class Ldap {
  constructor(config) {
    this.ldapConfig = config;
    const url = `${this.ldapConfig.host}:${this.ldapConfig.port}`
    this.ldapClient = new Client({
        url: url,
        timeout: 5000,
        connectTimeout: 10000,
        tlsOptions: {
          minVersion: 'TLSv1.2',
        },
        strictDN: true,
    });
    this.attributes = ['displayname','createtimestamp','uid','employeenumber','title','ucdappointmenttitlecode',
                       'ou','departmentnumber','modifytimestamp', 'edupersonaffiliation', 'ucdpersonaffiliation',
                       'ucdpersonsponsorexpirationdate', 'ucdappointmentpercenttime', 'ucdappointmentbegindate',
                       'ucdappointmentenddate', 'ucdappointmentdepartmentcode','mail','givenname','sn',
                       'ucdstudentlevel','ucdstudentsid','ucdstudentmajor',
                       'postaladdress','telephonenumber','ucdpersoniamid'
                      ]
  }

  async bind(){
    await this.ldapClient.bind(
        this.ldapConfig.user, 
        this.ldapConfig.password
    );
  }

  async unbind(){
    this.ldapClient.unbind();
  }

  async search(query){
    try {
        await this.bind();

        const filter = this.getFilter(query);

        const { searchEntries } = await this.ldapClient.search(this.ldapConfig.base, {
            scope: 'sub',
            filter: `${filter}`,
            attributes: this.attributes
        });

        return searchEntries;


    } catch (e) {
      return { error: true, message: e.message };

    } finally {
      await this.unbind();
    }
    
  }

  getFilter(query){
    const keys = Object.keys(query);
    let filter = `(`;

    if(keys.includes("userId")){
        filter = filter + `|(uid=${query.userId}*)`;
    }
    else if(keys.includes("employeeId")) {
        filter = filter + `|(employeenumber=${query.employeeId})(ucdpersonuuid=${query.employeeId})`;
    }
    else if(keys.includes("studentId")) {
        filter = filter + `|(ucdstudentsid=${query.studentId})`;
    }
    else if(keys.includes("iamId")) {
        filter = filter + `|(ucdpersoniamid=${query.iamId})`;
    }
    else if(keys.includes("email")) {
        filter = filter + `|(mail=${query.email})`;
    }
    else if(keys.includes("firstname") || keys.includes("lastname") ) {
        if (keys.includes("firstname") && keys.includes("lastname") ) {
            filter = filter + `&(sn=${query.lastname}*)(givenname=${query.firstname}*)`;
        }
        else if(keys.includes("firstname")) {
            filter = filter + `|(givenname=${query.firstname}*)`;
        } 
        else if(keys.includes("lastname")) {
            filter = filter + `|(sn=${query.lastname}*)`;
        }
    } 

    filter = filter + `)`

    return filter;
  }

  

}

export default Ldap;
