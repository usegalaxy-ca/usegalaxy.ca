locals {
    project_name = "usegal"
    auth_url = "https://beluga.cloud.computecanada.ca:5000/v3"
    region = "RegionOne"

    global_config = yamldecode(file(format("%s/cluster.yml", path.module)))
    user_config = local.global_config[var.USERNAME]
    instances_info = local.user_config.instances
    floating_ips = local.user_config.floating_ips
    volumes = local.user_config.volumes
}

resource "local_file" "inventory" {
  content = templatefile("templates/inventory.ini", {
    username = var.USERNAME
    hosts = { for name, info in local.instances_info : name => module.openstack.instance_names[name] }
  })
  filename = format("%s/../ansible/hosts", path.module)
  file_permission = "0644"
}

resource "local_file" "group_vars" {
  content = templatefile("templates/group_vars.yml", {
      volumes = module.openstack.volumes_info
  })
  filename = format("%s/../ansible/group_vars/terraform.yml", path.module)
  file_permission = "0644"
}

module "openstack" {
  source             = "./modules/openstack"
  openstack = {
      auth_url = local.auth_url
      region = local.region
  }
  project_name       = local.project_name
  instances_info = local.instances_info
  floating_ips = local.floating_ips
  volumes = local.volumes

  INSTANCE_NAME_PREFIX = var.INSTANCE_NAME_PREFIX
  USERNAME = var.USERNAME
  PUBLIC_KEY = var.PUBLIC_KEY
}

output "public_IP" {
  description = "Public IP address of the gateway instance"
  value       = module.openstack.public_IP
}

output "private_IPs" {
  description = "Private IP address of each instance"
  value       = module.openstack.private_IPs
}

variable "INSTANCE_NAME_PREFIX" {
  type    = string
}

variable "USERNAME" {
  type    = string
}

variable "PUBLIC_KEY" {
  type    = string
}

