/*export */ class ACCESS_MATRIX_MODEL {
  ACCESS_ID: any;
  USERNAME: any;
  PW_HASH: any;
  EMAIL: any;
  UPDATED_AT: any;
  constructor(
    ACCESS_ID: any,
    USERNAME: any,
    EMAIL: any,
    PW_HASH: any,
    UPDATED_AT: any
  ) {
    if (arguments.length != 5) {
      return;
    }
    this.ACCESS_ID = ACCESS_ID;
    this.USERNAME = USERNAME;
    this.PW_HASH = PW_HASH;
    this.EMAIL = EMAIL;
    this.UPDATED_AT = UPDATED_AT;
  }
}

module.exports = {
  ACCESS_MATRIX_MODEL: ACCESS_MATRIX_MODEL,
};
