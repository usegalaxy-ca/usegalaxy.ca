locals {
    project_name = "usegal"
    auth_url = "https://beluga.cloud.computecanada.ca:5000/v3"
    region = "RegionOne"

    global_config = yamldecode(file(format("%s/cluster.yml", path.module)))
    user_config = local.global_config[var.USERNAME]
    instances_info = local.user_config.instances
    gateway_name = local.user_config.gateway_name
}

resource "local_file" "inventory" {
  content = templatefile("templates/inventory.ini", {
    username = var.USERNAME
    hosts = { for name, info in local.instances_info : name => module.openstack.instance_names[name] }
  })
  filename = format("%s/../ansible/hosts", path.module)
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
  gateway_name = local.gateway_name

  INSTANCE_NAME_PREFIX = var.INSTANCE_NAME_PREFIX
  PUBLIC_IP = var.PUBLIC_IP
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

variable "PUBLIC_IP" {
  type    = string
}

variable "USERNAME" {
  type    = string
}

variable "PUBLIC_KEY" {
  type    = string
}

