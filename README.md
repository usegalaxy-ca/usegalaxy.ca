# cg-usegalaxy.ca

- Based on the step 1 of the tutorial [Galaxy Installation with Ansible][GIWA] 
  and the  [Ansible-Galaxy Role][AGR]

- Simply wrapped with Vagrant for local development installation on a VM using VirtualBox

## Installation Steps

You can setup several different galaxies with different settings to test. "galaxy1" is
provided all set and ready for your first working example)

### You need first to setup your ansible vault (Section 5 to 7 of the tutorial step 1)
- At the root directory create your vault password (location indicated in ansible.cfg)

`openssl rand -base64 24 > .vault-password.txt`

- In your galaxy directory (galaxy1/ for example)

`ansible-vault create group_vars/secret.yml`

- This will open and editor in which you write
`vault_id_secret: WHAT_EVER_KEY_STRING_YOU_WANT`

- Ansible will then encript it and replace group_vars/secret.yml

### Give an IP address and a host name to each Galaxy experiment 
- Edit `Vagrantfile`
- Edit `/etc/hosts` to add your hostname as it appears in `galaxyservers.inv`

 
### Then you are ready to build
- At the root of the repo

`vagrant up galaxy1` 

or to update if your VM is already up

`vagrant provision galaxy1`


License
-------

[Academic Free License ("AFL") v. 3.0][afl]




[GIWA]: https://training.galaxyproject.org/training-material/topics/admin/tutorials/ansible-galaxy/tutorial.html
[afl]: http://opensource.org/licenses/AFL-3.0
[AGR]: https://github.com/galaxyproject/ansible-galaxy
