import { Provider as BaseProvider } from '@pulumi/openstack';
import { Env } from './env';

export class Provider extends BaseProvider {
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
