// src/lib/auth.ts
import { createAuth0Client, Auth0Client } from "@auth0/auth0-spa-js";

let auth0Client: Auth0Client | null = null;

export const getAuth0Client = async () => {
  if (auth0Client) return auth0Client;

  auth0Client = await createAuth0Client({
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!, // seu domínio Auth0
    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!, // seu client id
    authorizationParams: {
      redirect_uri: window.location.origin, // onde o Auth0 deve redirecionar após login
    },
    cacheLocation: "localstorage",
    useRefreshTokens: true,
  });

  return auth0Client;
};

export const login = async () => {
  const client = await getAuth0Client();
  await client.loginWithRedirect();
};

export const logout = async () => {
  const client = await getAuth0Client();
  client.logout({
    returnTo: window.location.origin
  });
};

export const getUser = async () => {
  const client = await getAuth0Client();
  return await client.getUser();
};

export const handleRedirectCallback = async () => {
  const client = await getAuth0Client();
  return await client.handleRedirectCallback();
};
