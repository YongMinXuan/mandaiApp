/*export */ class ACCESS_MATRIX_ROLES_MODEL {
  ROLE_ID: any;
  ROLE_NAME: any;
  DESCRIPTION: any;
  UPDATED_AT: any;
  constructor(ROLE_ID: any, ROLE_NAME: any, DESCRIPTION: any, UPDATED_AT: any) {
    if (arguments.length != 4) {
      return;
    }
    this.ROLE_ID = ROLE_ID;
    this.ROLE_NAME = ROLE_NAME;
    this.DESCRIPTION = DESCRIPTION;
    this.UPDATED_AT = UPDATED_AT;
  }
}

module.exports = {
  ACCESS_MATRIX_ROLES_MODEL: ACCESS_MATRIX_ROLES_MODEL,
};
