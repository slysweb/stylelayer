/**
 * Volcano Engine API request signing (HMAC-SHA256).
 * Standalone implementation to avoid @volcengine/openapi native deps (lz4) incompatible with Edge.
 */
import HmacSHA256 from "crypto-js/hmac-sha256";
import SHA256 from "crypto-js/sha256";

const ALGORITHM = "HMAC-SHA256";
const V4_IDENTIFIER = "request";

function uriEscape(str: string): string {
  try {
    return encodeURIComponent(str)
      .replace(/[^A-Za-z0-9_.~\-%]+/g, (ch) => encodeURIComponent(ch))
      .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch {
    return "";
  }
}

function sortParams(params: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  for (const k of Object.keys(params).sort()) {
    const v = params[k];
    if (v !== undefined && v !== null) sorted[k] = v;
  }
  return sorted;
}

function queryParamsToString(params: Record<string, string>): string {
  return Object.entries(sortParams(params))
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${uriEscape(k)}=${uriEscape(String(v))}`)
    .join("&");
}

function getDateTime(): string {
  return new Date()
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[:\-]|\.\d{3}/g, "");
}

function createScope(date: string, region: string, service: string): string {
  return `${date.slice(0, 8)}/${region}/${service}/${V4_IDENTIFIER}`;
}

function hmac(key: Parameters<typeof HmacSHA256>[1], data: string) {
  return HmacSHA256(data, key);
}

function sha256Hex(data: string): string {
  return SHA256(data).toString();
}

export function signRequest(
  options: {
    method: string;
    pathname: string;
    region: string;
    service: string;
    params: Record<string, string>;
    headers: Record<string, string>;
    body: string;
  },
  credentials: { accessKeyId: string; secretKey: string }
): Record<string, string> {
  const { method, pathname, region, service, params, body } = options;
  const datetime = getDateTime();
  const credentialScope = createScope(datetime, region, service);

  const headers: Record<string, string> = {
    Host: "visual.volcengineapi.com",
    "Content-Type": "application/json",
    "X-Date": datetime,
    "X-Content-Sha256": sha256Hex(body),
  };

  const queryString = queryParamsToString(params);
  const signedHeaders = "host;x-content-sha256;x-date";
  const canonicalHeaders = [
    "host:visual.volcengineapi.com",
    `x-content-sha256:${sha256Hex(body)}`,
    `x-date:${datetime}`,
  ].join("\n");

  const canonicalRequest = [
    method.toUpperCase(),
    pathname || "/",
    queryString,
    `${canonicalHeaders}\n`,
    signedHeaders,
    sha256Hex(body),
  ].join("\n");

  const stringToSign = [
    ALGORITHM,
    datetime,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(credentials.secretKey, datetime.slice(0, 8));
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, V4_IDENTIFIER);
  const signature = hmac(kSigning, stringToSign).toString();

  const authHeader = [
    `${ALGORITHM} Credential=${credentials.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  return {
    ...headers,
    Authorization: authHeader,
  };
}
