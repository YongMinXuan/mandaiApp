/*export */ class ACCESS_MATRIX_PERMISSIONS_MODEL {
  PERMISSION_ID: any;
  PERMISSION: any;
  DESCRIPTION: any;
  UPDATED_AT: any;
  constructor(
    PERMISSION_ID: any,
    PERMISSION: any,
    DESCRIPTION: any,
    UPDATED_AT: any
  ) {
    if (arguments.length != 4) {
      return;
    }
    this.PERMISSION_ID = PERMISSION_ID;
    this.PERMISSION = PERMISSION;
    this.DESCRIPTION = DESCRIPTION;
    this.UPDATED_AT = UPDATED_AT;
  }
}

module.exports = {
  ACCESS_MATRIX_PERMISSIONS_MODEL: ACCESS_MATRIX_PERMISSIONS_MODEL,
};
