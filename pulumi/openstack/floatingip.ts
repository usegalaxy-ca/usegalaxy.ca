import { Provider, compute } from '@pulumi/openstack';
import { FloatingIpConfig } from './schema';

export class FloatingIp extends compute.FloatingIpAssociate {
  public config: FloatingIpConfig;

  constructor(
    config: FloatingIpConfig,
    instance: compute.Instance,
    provider: Provider
  ) {
    super(
      config.ip,
      {
        floatingIp: config.ip,
        instanceId: instance.id,
        waitUntilAssociated: true,
      },
      { provider: provider }
    );
    this.config = config;
  }
}
