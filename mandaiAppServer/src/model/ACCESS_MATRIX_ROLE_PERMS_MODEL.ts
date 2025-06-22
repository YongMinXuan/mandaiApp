/*export */ class ACCESS_MATRIX_ROLE_PERMS_MODEL {
  ROLE_PERMISSION_ID: any;
  ROLE_ID: any;
  PERMISSION_ID: any;
  UPDATED_AT: any;
  constructor(
    ROLE_PERMISSION_ID: any,
    PERMISSION_ID: any,
    ROLE_ID: any,
    UPDATED_AT: any
  ) {
    if (arguments.length != 4) {
      return;
    }
    this.ROLE_PERMISSION_ID = ROLE_PERMISSION_ID;
    this.ROLE_ID = ROLE_ID;
    this.PERMISSION_ID = PERMISSION_ID;
    this.UPDATED_AT = UPDATED_AT;
  }
}

module.exports = {
  ACCESS_MATRIX_ROLE_PERMS_MODEL: ACCESS_MATRIX_ROLE_PERMS_MODEL,
};
