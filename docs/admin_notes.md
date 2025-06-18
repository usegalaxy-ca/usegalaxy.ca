# UseGalaxy.ca : Notes on Installation and Administration

- Started with [Galaxy Installation with Ansible][GIWA] using [Ansible-Galaxy Role][AGR]

## Doppler

Doppler is used to keep secret variables in your project. Projects are divided in roles so you can set
different values for each of your environment. Dev, testing, prod, etc...

- Setup your Doppler account and projet here: [Doppler.com][Dopp]

- Authenticate and authorise the Doppler Client (CLI) in your client machine account

```bash
# Just follow the instruction
doppler login
```

- Or preferably link your working directory (root of the project) with an "Access Service Token" generated via the doppler web site in your project and corresponding role (environment).
- ... and run the setup command to link the project
- note: requires read/write token

```bash
cd /your-project-directory/
echo 'THE_GENERATED_TOKEN' | doppler configure set token --scope .
doppler setup
```

- To have Doppler inject all your secrets through environmenet variables accessible at run time by your application

```bash
doppler run -- your-command-here
```

- Other doppler commands:

```bash
# Display the value of one secret variable
doppler run --command="echo \$SECRET_VAR_NAME"
```

## Terraform

Adjust your cluster using the cluster.yml file, the first level of your cluster description needs to match TF_VAR_USERNAME env variable

The available parameters and their default values can be found in the instances_info variable of the [terraform/modules/openstack/variables.tf](../terraform/modules/openstack/variables.tf) file

```bash
cd terraform/
terraform init
# To run terraform. Terraform will show you what will be changed (its "plan of action") before applying the changes.
doppler run -- terraform apply
```

## Ansible

Favor using the usegalaxy executable in the ansible folder to run anything related to ansible.

This prevents several disastrous mistakes by among other things:

- Ensuring the correct python virtual environment is used
- Ensuring doppler is used to inject secrets
- Prevents multiple playbooks from running at the same time

This executable should be run from the ansible subfolder

### Install ansible-roles

Will create a python virtual environment and install the python dependencies as well as the ansible roles and collections in the ~/.ansible/ directory

```bash
cd ansible/
./usegalaxy requirements
```

### Run the playbook

```bash
cd ansible/
./usegalaxy $TAG
```

Where $TAG is the name of a playbook: all for all.yaml, galaxy for galaxy.yml, slurm, etc...

use the --init flag on the first run. This will add extra steps to ensure compatibility with preexisting volumes.

```bash
cd ansible/
./usegalaxy all --init
```

[Dopp]: https://www.doppler.com/
[AGR]: https://github.com/galaxyproject/ansible-galaxy
[GIWA]: https://training.galaxyproject.org/training-material/topics/admin/tutorials/ansible-galaxy/tutorial.html

## NFS

The galaxy and slurm instances depend on a shared file system. This is achieved using NFS.

In order for the NFS clients to recover if the NFS server is recreated (e.g. after increasing the RAM
of the NFS server), the NFS server must be recreated with the same IP address, otherwise it will be
stuck in an infinite retry loop.

Note that this will most likely require a restart of the galaxy instance if there is any downtime.

on the galaxy node:

```bash
sudo galaxyctl restart
```

## Training

In terraform/modules/openstack/ansible.tf change "main_nodes" to include all nodes that are *not* reserved for training. The following code for example will reverse all nodes with index 0 for training.

```hcl
output "main_nodes" {
     value = "${join(",", [
         for host in local.ansible_hosts["slurmexecservers"] :
             host.name if length(regexall(".*0", host.name)) > 0
     ])}"
 }
```
rerun terraform apply and ansible(slurm.yml playbook) to apply

Anyone with a role or belonging to a group with a role that starts with "training" can use training nodes (see current TPV config)

## Pulsar Registry

the pulsar_registry runs on the same server as galaxy and responds to requests at /api/pulsar. The code and sqilte DB are found in /home/galaxy/ and is run by the galaxy user.

It runs as a systemd service so the usualy systemctl/journalctl commands can be used to check the status.

ACCP registers pulsars with CRUD operations at /api/pulsar. The server uses a sqlite database to keep track of pulsar configurations and users.

The server will periodically sync it's state with the galaxy DB, o

The table user_preference for each user will look like this:
```
 id | user_id |          name          |                            value
----+---------+------------------------+-------------------------------------------------------------
  1 |       2 | extra_user_preferences | {"accp|pulsar_host": "test", "accp|pulsar_api_key": "test"}
```

user_preferences can be accessed by TPV for job routing(see current TPV config).
