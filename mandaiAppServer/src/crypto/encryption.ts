import SimpleCrypto from "simple-crypto-js";
import { GLOBALVARS } from "../globalvariable/GLOBALVARS";
//Using library to encrypt with values from global vars to complete encryption.
const decrypt = (plainText: string) => {
  var _secretKey = GLOBALVARS.PASSKEY;
  var simpleCrypto = new SimpleCrypto(_secretKey);
  var decryptedText = simpleCrypto.decrypt(plainText);
  return decryptedText;
};

const encrypt = (plainText: string | number | boolean | object) => {
  var _secretKey = GLOBALVARS.PASSKEY;
  var simpleCrypto = new SimpleCrypto(_secretKey);
  var encryptedText = simpleCrypto.encrypt(plainText);
  return encryptedText;
};

export const cryptography = {
  decrypt,
  encrypt,
};
