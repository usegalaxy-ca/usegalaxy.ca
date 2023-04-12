# usegalaxy.ca

- Based on [Galaxy Installation with Ansible][GIWA] and the  [Ansible-Galaxy Role][AGR]

### Install ansible-roles

Resolver Issue workaround: There is an issue with the resolver, this fix below is needed first in your sudoers (cg-admin) account. 
This issue should be resolved eventually by ansible
```
- sudo apt install -y pip
- pip install ansible-core
- pip install -Iv 'resolvelib<0.6.0'
```
Then install the ansible roles and collections. They will be installed in ~/.ansible/ by default

```
ansible-galaxy install -r requirements.yml
```

### Run the playbook
Note that the hosts inventory is indicated in the ansible.cfg file
```
ansible-playbook -i galaxyservers-XYZ.inv galaxy.yml
```



License
-------

[Academic Free License ("AFL") v. 3.0][afl]




[GIWA]: https://training.galaxyproject.org/training-material/topics/admin/tutorials/ansible-galaxy/tutorial.html
[afl]: http://opensource.org/licenses/AFL-3.0
[AGR]: https://github.com/galaxyproject/ansible-galaxy
