export class Env {
  public static AUTH_URL = "https://beluga.cloud.computecanada.ca:5000/v3";
  public static REGION = "RegionOne";
  public static INSTANCE_NAME_PREFIX = get_env("TF_VAR_INSTANCE_NAME_PREFIX");
  public static USER_NAME = get_env("TF_VAR_USER_NAME");
  public static PUBLIC_KEY = get_env("TF_VAR_PUBLIC_KEY");
  public static APP_CRED_ID = get_env("OS_APPLICATION_CREDENTIAL_ID");
  public static APP_CRED_NAME = get_env("OS_APPLICATION_CREDENTIAL_NAME");
  public static APP_CRED_SECRET = get_env("OS_APPLICATION_CREDENTIAL_SECRET");
}

function get_env(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}
