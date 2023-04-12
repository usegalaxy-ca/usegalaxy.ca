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

module "openstack" {
  source             = "./modules/openstack"
  INSTANCE_NAME_PREFIX = var.INSTANCE_NAME_PREFIX
  PUBLIC_IP = var.PUBLIC_IP
  USERNAME = var.USERNAME
  PUBLIC_KEY = var.PUBLIC_KEY
}

output "galaxy_ip" {
  value = module.openstack.galaxy_ip
}
