terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.35.0"
    }
  }
}

provider "openstack" {
  auth_url = var.openstack.auth_url
  region = var.openstack.region
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
  instance_id           = openstack_compute_instance_v2.proxy.id
  wait_until_associated = true
}

resource "openstack_compute_instance_v2" "instances" {
  for_each = var.instances_info
  name        = "${var.INSTANCE_NAME_PREFIX}-${var.project_name}-${each.key}"
  image_name  = each.value.image
  flavor_name = each.value.flavor
  user_data   = local.node_user_data
  block_device {
    delete_on_termination = true
    destination_type      = "volume"
    source_type           = "image"
    #under compute -> images, must match the image name
    uuid                  = each.value.image_uuid
    volume_size           = each.value.volume_size
  }
  security_groups = each.value.security_groups
  network {
    uuid = each.value.network_uuid
  }
}
