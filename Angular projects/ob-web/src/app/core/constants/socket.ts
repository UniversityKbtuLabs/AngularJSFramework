/* eslint-disable max-len */
import { environment } from '@env/environment';

export const apiKeyParams = {
  Function: 'SetAPIKey',
  Param: {
    apiKey: environment.wsApiKey,
  },
  TumarCSP: 'SYSAPI',
};

export const checkApiKey = {
  Function: 'CheckAPIKey',
  Param: {
    apiKey: environment.wsApiKey,
  },
  TumarCSP: 'SYSAPI',
};

export const tumarVersionParams = {
  TumarCSP: 'BaseAPI',
  Function: 'GetVersion',
  Param: {
    type: '3',
  },
};

export const LoadKeyFromTokensParams = {
  TumarCSP: 'BaseAPI',
  Function: 'LoadKeyFromTokens',
  Param: {
    id: '18224f60420',
  },
};

export const nativeSignOptions = {
  TumarCSP: 'BaseAPI',
  Param: {
    data: '',
    hashType: 0,
    id: Date.now().toString(16),
    isConvert: false,
    pass: '',
    profile: '',
    sn: '',
  },
  Function: 'NativeSign',
};

// переделать данный вызов
export const getProfileOptions = {
  TumarCSP: 'BaseAPI',
  Function: 'GetProfInfo',
  Param: {
    pass: '',
    profile: '',
  },
};

export const getMacAddressOptions = {
  TumarCSP: 'SYSAPI',
  Function: 'GetMACAddress',
  Param: {
    isIp: true,
  },
};

export const getCertificateInfoOptions = {
  Function: 'ShowInfoCertificate',
  TumarCSP: 'ASNAPI',
  Param: {
    data: '',
    id: '1825ec5da3b',
  },
};

export const getCardInfo = {
  TumarCSP: 'BaseAPI',
  Function: 'getIdCardInfo',
  Param: {
    id: Date.now().toString(16),
  },
};

export const changePasswdOptions = {
  TumarCSP: 'BaseAPI',
  Function: 'ChangePasswd',
  Param: {
    id: '',
    newPass: '',
    pass: '',
    profile: '',
  },
};
