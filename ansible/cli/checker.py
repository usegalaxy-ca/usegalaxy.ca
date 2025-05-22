from git import Repo

REPO_PATH = "."


def check_uncommitted_changes():
    """
    Checks for uncommitted changes in a Git repository (ie. is dirty).

    Returns:
        bool: True if there are uncommitted changes, False otherwise.
    """
    repo = Repo(REPO_PATH, search_parent_directories=True)
    return repo.is_dirty(untracked_files=True)


def check_unpulled_changes():
    """
    Checks for unpulled changes in a Git repository.

    Returns:
        tuple: The number of unpulled commits, and a message indicating the status of the repository.
        If there are unpulled commits, the message will contain details about the local and remote branches.
        If there are no unpulled commits, the message will be None.

    Raises:
        Exception: If the fetch operation is rejected.
    """
    unpulled, msg = 0, None
    repo = Repo(REPO_PATH, search_parent_directories=True)

    for remote in repo.remotes:
        fetch_info = remote.fetch()[0]

        if fetch_info.flags & fetch_info.REJECTED:
            raise Exception(f"Fetch from {remote.name} was rejected.")

        local_branch = repo.active_branch
        remote_branch = remote.refs[local_branch.name]

        if local_branch.commit != remote_branch.commit:
            unpulled = len(list(repo.iter_commits(rev=f'{local_branch.name}..{remote_branch.name}')))
            msg = (
                f"{unpulled} unpulled commits detected in the repository.\n\n"
                f"Local branch '{local_branch.name}' is behind remote branch '{remote_branch.name}'.\n"
                f"Local commit: {local_branch.commit.hexsha}\n"
                f"Remote commit: {remote_branch.commit.hexsha}\n\n"
                "Please pull the latest changes: git pull origin\n"
            )

    return unpulled, msg


def run_checks():
    """
    Run checks for uncommitted and unpulled changes in the repository.
    """
    if check_uncommitted_changes():
        raise Exception("Uncommitted changes detected in the local usegalaxy git repository.")

    unpulled, msg = check_unpulled_changes()
    if unpulled > 0:
        raise Exception(msg)
