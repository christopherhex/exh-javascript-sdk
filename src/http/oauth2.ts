import axios from 'axios';
import btoa from '../btoa';
import { ParamsOauth2 } from '../types';
import {
  HttpInstance,
  MfaConfig,
  OAuth2Config,
  OAuthClient,
  TokenDataOauth2,
} from './types';
import {
  camelizeResponseData,
  retryInterceptor,
  transformKeysResponseData,
  transformResponseData,
  typeReceivedErrorsInterceptor,
} from './interceptors';
import { AUTH_BASE } from '../constants';

const TOKEN_ENDPOINT = `${AUTH_BASE}/oauth2/tokens`;

export function createOAuth2HttpClient(
  http: HttpInstance,
  options: ParamsOauth2
): OAuthClient {
  let tokenData: TokenDataOauth2;
  let authConfig: OAuth2Config;

  const clientCredentials = getClientCredentials(options);

  const httpWithAuth = axios.create({
    ...http.defaults,
    headers: {},
  });

  httpWithAuth.defaults.headers = http.defaults.headers;

  const { requestLogger, responseLogger } = options;
  if (requestLogger) {
    httpWithAuth.interceptors.request.use(
      config => {
        requestLogger(config);
        return config;
      },
      error => {
        requestLogger(error);
        return Promise.reject(error);
      }
    );
  }

  if (responseLogger) {
    httpWithAuth.interceptors.response.use(
      response => {
        responseLogger(response);
        return response;
      },
      error => {
        responseLogger(error);
        return Promise.reject(error);
      }
    );
  }

  const refreshTokens = async () => {
    const tokenResult = await http.post(TOKEN_ENDPOINT, {
      grant_type: 'refresh_token',
      refresh_token: tokenData.refreshToken,
    });
    await setTokenData(tokenResult.data);
    return tokenResult.data;
  };

  // If set, add the access token to each request
  httpWithAuth.interceptors.request.use(async config => {
    if (!tokenData?.accessToken) {
      return config;
    }

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
    };
  });

  httpWithAuth.interceptors.response.use(null, retryInterceptor(httpWithAuth));

  // If we receive a expired/unknown access token error, refresh the tokens
  httpWithAuth.interceptors.response.use(null, async error => {
    if (!error || !error.isAxiosError || !error.response) {
      throw error;
    }

    const originalRequest = error.config;
    if (
      [400, 401, 403].includes(error.response.status) &&
      // ACCESS_TOKEN_EXPIRED_EXCEPTION or ACCESS_TOKEN_UNKNOWN_EXCEPTION
      [118, 117].includes(error.response?.data?.code) &&
      !originalRequest.isRetryWithRefreshedTokens
    ) {
      originalRequest.isRetryWithRefreshedTokens = true;
      await refreshTokens();
      return http(originalRequest);
    }

    throw error;
  });

  httpWithAuth.interceptors.response.use(null, typeReceivedErrorsInterceptor);

  httpWithAuth.interceptors.response.use(camelizeResponseData);
  httpWithAuth.interceptors.response.use(transformResponseData);
  httpWithAuth.interceptors.response.use(transformKeysResponseData);

  async function setTokenData(data: TokenDataOauth2) {
    if (options.freshTokensCallback) {
      await options.freshTokensCallback(data);
    }
    tokenData = data;
  }

  async function authenticate(data: OAuth2Config): Promise<TokenDataOauth2> {
    authConfig = data;

    /* Monkeypatch the btoa function. See https://github.com/ExtraHorizon/javascript-sdk/issues/446 */
    if (clientCredentials.client_secret && typeof global.btoa !== 'function') {
      global.btoa = btoa;
    }

    const tokenResult = await http.post(
      TOKEN_ENDPOINT,
      {
        ...clientCredentials,
        ...authConfig.params,
      },
      clientCredentials.client_secret
        ? {
            auth: {
              username: clientCredentials.client_id,
              password: clientCredentials.client_secret,
            },
          }
        : {}
    );
    await setTokenData(tokenResult.data);
    return tokenResult.data;
  }

  async function confirmMfa({
    token,
    methodId,
    code,
  }: MfaConfig): Promise<TokenDataOauth2> {
    const tokenResult = await http.post(
      TOKEN_ENDPOINT,
      {
        ...clientCredentials,
        ...authConfig.params,
        grant_type: 'mfa',
        token,
        code,
        method_id: methodId,
      },
      clientCredentials.client_secret
        ? {
            auth: {
              username: clientCredentials.client_id,
              password: clientCredentials.client_secret,
            },
          }
        : {}
    );
    await setTokenData(tokenResult.data);
    return tokenResult.data;
  }

  function logout(): boolean {
    tokenData = null;
    return true;
  }

  /*
   * The default way of adding a getter does not seem to work well with RN at
   * the moment. This way always works.
   */
  return Object.defineProperty(
    {
      ...httpWithAuth,
      authenticate,
      confirmMfa,
      logout,
    },
    'userId',
    {
      get() {
        return Promise.resolve(tokenData?.userId);
      },
    }
  ) as OAuthClient;
}

function getClientCredentials({ clientId, clientSecret }: ParamsOauth2) {
  const credentials: OAuth2ClientCredentials = {
    client_id: clientId,
  };

  if (clientSecret) {
    credentials.client_secret = clientSecret;
  }

  return credentials;
}

interface OAuth2ClientCredentials {
  client_id: string;
  client_secret?: string;
}
