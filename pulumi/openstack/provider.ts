import { Provider } from "@pulumi/openstack";
import { Env } from "./env";

export class OpenStackProvider extends Provider {
  constructor(name: string) {
    super(name, {
      authUrl: Env.AUTH_URL,
      region: Env.REGION,
      applicationCredentialId: Env.APP_CRED_ID,
      applicationCredentialName: Env.APP_CRED_NAME,
      applicationCredentialSecret: Env.APP_CRED_SECRET,
    });
  }
}
