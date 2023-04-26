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

variable "openstack" {
    type = object({
        auth_url = string
        region = string
    })
    default = {
        auth_url = "https://beluga.cloud.computecanada.ca:5000/v3"
        region = "RegionOne"
    }
}

variable "project_name" {
  type    = string
  default = "usegal"
}

variable "resources" {
    type = map(object({
        flavor = string
        volume_size = optional(number, 30)
        image = optional(string, "Ubuntu-22.04.2-Jammy-x64-2023-02")
        image_uuid = optional(string, "db73980e-1f9c-441e-8268-c1881f99c8ef")
        network_uuid = optional(string, "39e2642a-7afe-4e64-abf2-5c6a7b05912d")
        security_groups = optional(list(string), ["web", "TUSd", "default"])
    }))
}
