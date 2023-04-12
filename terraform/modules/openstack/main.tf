terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.35.0"
    }
  }
}

provider "openstack" {
  auth_url = "https://beluga.cloud.computecanada.ca:5000/v3"
  region = "RegionOne"
}

locals {
    gateway_user_data  = templatefile("cloudinit/gateway.yml", {
       username = "${var.USERNAME}"
       public_key = "${var.PUBLIC_KEY}"
    })
    node_user_data  = templatefile("cloudinit/node.yml", {
       username = "${var.USERNAME}"
       public_key = "${var.PUBLIC_KEY}"
    })
}

resource "openstack_compute_floatingip_associate_v2" "fip_1" {
  floating_ip           = "${var.PUBLIC_IP}"
  instance_id           = openstack_compute_instance_v2.galaxy.id
  wait_until_associated = true
}

resource "openstack_compute_instance_v2" "galaxy" {
  name        = "${var.INSTANCE_NAME_PREFIX}-galaxy"
  image_name  = "Ubuntu-22.04.2-Jammy-x64-2023-02"
  flavor_name = "p4-7.5gb"
  user_data   = local.node_user_data
  block_device {
    delete_on_termination = true
    destination_type      = "volume"
    source_type           = "image"
    uuid                  = "43f6cb7a-43cd-4205-8d10-01b052bd6819"
    volume_size           = 30 
  }
  security_groups = ["web", "TUSd", "default"]
  network {
    uuid = "39e2642a-7afe-4e64-abf2-5c6a7b05912d"
  }
}
