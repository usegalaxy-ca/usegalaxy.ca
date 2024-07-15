# UseGalaxy.ca : Notes on Installation and Administration

- Started with [Galaxy Installation with Ansible][GIWA] using [Ansible-Galaxy Role][AGR]

## Doppler

Doppler is used to keep secret variables in your project. Projects are divided in roles so you can set
different values for each of your environment. Dev, testing, prod, etc...

- Setup your Doppler account and projet here: [Doppler.com][Dopp]

- Authenticate and authorise the Doppler Client (CLI) in your client machine account

```
# Just follow the instruction
doppler login
```

- Or preferably link your working directory (root of the project) with an "Access Service Token" generated via the doppler web site in your project and corresponding role (environment).
- ... and run the setup command to link the project
- note: requires read/write token

```
cd /your-project-directory/
echo 'THE_GENERATED_TOKEN' | doppler configure set token --scope /usr/src/app
doppler setup
```

- To have Doppler inject all your secrets through environmenet variables accessible at run time by your application

```
doppler run -- your-command-here
```

- Other doppler commands:

```
# Display the value of one secret variable
doppler run --command="echo \$SECRET_VAR_NAME"
```

## Terraform

Adjust your cluster using the cluster.yml file, the first level of your cluster description needs to match TF_VAR_USERNAME env variable

The available parameters and their default values can be found in the instances_info variable of the [terraform/modules/openstack/variables.tf](../terraform/modules/openstack/variables.tf) file

```
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

```
cd ansible/
./usegalaxy requirements
```

### Run the playbook

```
cd ansible/
./usegalaxy $TAG
```

Where $TAG is the name of a playbook: all for all.yaml, galaxy for galaxy.yml, slurm, etc...

use the --init flag on the first run. This will add extra steps to ensure compatibility with preexisting volumes.

```
cd ansible/
./usegalaxy all --init
```

[Dopp]: https://www.doppler.com/
[AGR]: https://github.com/galaxyproject/ansible-galaxy
[GIWA]: https://training.galaxyproject.org/training-material/topics/admin/tutorials/ansible-galaxy/tutorial.html
