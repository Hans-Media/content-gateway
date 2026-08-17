import crypto from "crypto";

/**
 * Minimal OAuth 1.0a request signer (HMAC-SHA1), used for the X (Twitter) API v1.1
 * media upload endpoint which still requires OAuth 1.0a user-context auth.
 */
export function buildOAuth1Header(opts: {
  method: string;
  url: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
  extraParams?: Record<string, string>;
}) {
  const { method, url, apiKey, apiSecret, accessToken, accessSecret } = opts;
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const allParams: Record<string, string> = {
    ...oauthParams,
    ...(opts.extraParams ?? {}),
  };

  const paramString = Object.keys(allParams)
    .sort()
    .map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`
    )
    .join("&");

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString),
  ].join("&");

  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(
    accessSecret
  )}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  const headerParams: Record<string, string> = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const header =
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map(
        (k) => `${encodeURIComponent(k)}="${encodeURIComponent(headerParams[k])}"`
      )
      .join(", ");

  return header;
}
