import { compute } from "@pulumi/openstack";

export class FloatingIp extends compute.FloatingIpAssociate {
  constructor(name: string, address: IpAdress, instance: compute.Instance) {
    super(name, {
      floatingIp: address.toString(),
      instanceId: instance.id,
      waitUntilAssociated: true,
    });
  }
}

export class IpAdress {
  address: string;
  constructor(address: string) {
    if (!address) {
      throw new Error("Address must be provided");
    }
    if (!isValidIp(address)) {
      throw new Error("Address must be an IP address");
    }
    this.address = address;
  }

  toString() {
    return this.address;
  }
}

function isValidIp(address: string) {
  return address.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/);
}
