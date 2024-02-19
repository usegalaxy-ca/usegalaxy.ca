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

resource "openstack_blockstorage_volume_v2" "volumes" {
  for_each = { for volume in flatten([
                    for instance_name, volumes in var.volume_config: volumes
                        ]): volume.name => volume}
  name        = "${var.INSTANCE_NAME_PREFIX}-${var.project_name}-${each.key}"
  volume_type = each.value.type
  size        = each.value.size
}

resource "openstack_compute_volume_attach_v2" "volumes" {
  for_each = { for volume in flatten([
                    for instance_name, volumes in var.volume_config: flatten([
                        for volume in volumes: { 
                            name: volume.name,
                            attach_to: instance_name
                        }])]): volume.name => volume}
  instance_id = "${openstack_compute_instance_v2.instances[each.value.attach_to].id}"
  volume_id   = "${openstack_blockstorage_volume_v2.volumes[each.key].id}"
}

resource "openstack_compute_floatingip_associate_v2" "floating_ips" {
  for_each = { for ip in var.ip_config : ip.ip => ip }
  floating_ip           = "${each.value.ip}"
  instance_id           = openstack_compute_instance_v2.instances[each.value.attach_to].id
  wait_until_associated = true
}

resource "openstack_compute_instance_v2" "instances" {
  for_each = { for instance in local.flat_instance_config: instance.name => instance}
  name = "${var.INSTANCE_NAME_PREFIX}-${var.project_name}-${each.key}"
  image_name  = each.value.image
  flavor_name = each.value.flavor
  user_data   = local.node_user_data
  block_device {
    delete_on_termination = true
    destination_type      = "volume"
    source_type           = "image"
    uuid                  = each.value.image_uuid
    volume_size           = each.value.volume_size
    volume_type           = each.value.volume_type
  }
  security_groups = each.value.security_groups
  network {
    uuid = each.value.network_uuid
  }
}
