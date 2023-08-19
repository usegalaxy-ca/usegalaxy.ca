import { Instance } from './instance';
import { Volume } from './volume';
import { FloatingIp } from './floatingip';

function publicIps(floatingIps: FloatingIp[]) {
  throw new Error('Function not implemented.');
}

function privateIps(instances: Instance[]) {
  throw new Error('Function not implemented.');
}

function ansibleHosts(instances: Instance[]) {
  throw new Error('Function not implemented.');
}

function ansibleVolumes(volumes: Volume[]) {
  throw new Error('Function not implemented.');
}
