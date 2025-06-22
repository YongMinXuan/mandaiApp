/*export */ class ACCESS_MATRIX_USR_ROLES_MODEL {
  ACCESS_ID: any;
  ROLE_ID: any;
  USER_ROLE_ID: any;
  UPDATED_AT: any;
  constructor(
    ACCESS_ID: any,
    ROLE_ID: any,
    USER_ROLE_ID: any,
    UPDATED_AT: any
  ) {
    if (arguments.length != 4) {
      return;
    }
    this.ACCESS_ID = ACCESS_ID;
    this.ROLE_ID = ROLE_ID;
    this.USER_ROLE_ID = USER_ROLE_ID;
    this.UPDATED_AT = UPDATED_AT;
  }
}

module.exports = {
  ACCESS_MATRIX_USR_ROLES_MODEL: ACCESS_MATRIX_USR_ROLES_MODEL,
};
