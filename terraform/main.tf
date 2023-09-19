variable "INSTANCE_NAME_PREFIX" {
  type    = string
}

variable "USERNAME" {
  type    = string
}

variable "PUBLIC_KEY" {
  type    = string
}

locals {
    project_name = "usegal"
    auth_url = "https://beluga.cloud.computecanada.ca:5000/v3"
    region = "RegionOne"

    global_config = yamldecode(file(format("%s/cluster.yml", path.module)))
    user_config = local.global_config[var.CLUSTER_NAME]
    instance_config = local.user_config.instances
    ip_config = local.user_config.floating_ips
    volume_config = local.user_config.volumes
}

module "openstack" {
  source             = "./modules/openstack"
  openstack = {
      auth_url = local.auth_url
      region = local.region
  }
  project_name = local.project_name
  instance_config = local.instance_config
  ip_config = local.ip_config
  volume_config = local.volume_config

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

resource "local_file" "inventory" {
  content = templatefile("templates/inventory.ini", {
    username = var.USERNAME
    groups = module.openstack.ansible_hosts 
  })
  filename = format("%s/../ansible/hosts", path.module)
  file_permission = "0644"
}

resource "local_file" "group_vars" {
  content = templatefile("templates/group_vars.yml", {
      volumes = module.openstack.ansible_volumes
  })
  filename = format("%s/../ansible/group_vars/terraform.yml", path.module)
  file_permission = "0644"
}

resource "local_file" "slurm" {
  content = templatefile("templates/slurm.yml", {
      nodes = module.openstack.ansible_hosts
  })
  filename = format("%s/../ansible/group_vars/slurm.yml", path.module)
  file_permission = "0644"
}
