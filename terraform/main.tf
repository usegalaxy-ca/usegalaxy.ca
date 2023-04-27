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

locals {
    global_config = yamldecode(file(format("%s/cluster.yml", path.module)))
    user_config = local.global_config[var.USERNAME]
    instances_info = local.user_config.instances
    gateway_name = local.user_config.gateway_name
}


module "openstack" {
  source             = "./modules/openstack"
  INSTANCE_NAME_PREFIX = var.INSTANCE_NAME_PREFIX
  PUBLIC_IP = var.PUBLIC_IP
  USERNAME = var.USERNAME
  PUBLIC_KEY = var.PUBLIC_KEY
  instances_info = local.instances_info
  gateway_name = local.gateway_name
}


output "public_IP" {
  description = "Public IP address of the gateway instance"
  value       = module.openstack.public_IP
}

output "private_IPs" {
  description = "Private IP address of each instance"
  value       = module.openstack.private_IPs
}
