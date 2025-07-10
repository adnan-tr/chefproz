import os
import subprocess

# ---- CONFIG ----
REPO_NAME = "ichefpro"
GITHUB_SSH_URL = f"git@github.com:adnan-tr/ichefpro.git"
COMMIT_MESSAGE = "Initial commit"
BRANCH_NAME = "main"

# ---- FUNCTIONS ----
def run_cmd(cmd, cwd=None):
    print(f"🟡 Running: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"❌ Error running: {cmd}")
        exit(1)

def git_init_and_commit():
    if not os.path.isdir(".git"):
        run_cmd("git init")

    # Add a .gitignore if missing
    if not os.path.exists(".gitignore"):
        with open(".gitignore", "w") as f:
            f.write("node_modules/\nbuild/\n.env\n")

    run_cmd("git add .")

    # Check for uncommitted changes
    status = subprocess.check_output("git status --porcelain", shell=True).decode().strip()
    if status:
        run_cmd(f'git commit -m "{COMMIT_MESSAGE}"')
    else:
        print("🟢 Nothing new to commit. Working directory clean.")

def set_git_remote_and_push():
    # Check if remote exists
    remotes = subprocess.check_output("git remote", shell=True).decode().split()
    if "origin" in remotes:
        run_cmd(f"git remote set-url origin {GITHUB_SSH_URL}")
    else:
        run_cmd(f"git remote add origin {GITHUB_SSH_URL}")

    run_cmd(f"git branch -M {BRANCH_NAME}")
    run_cmd(f"git push -u origin {BRANCH_NAME}")

# ---- MAIN ----
if __name__ == "__main__":
    print("🚀 Uploading your React project to GitHub via SSH...\n")
    git_init_and_commit()
    set_git_remote_and_push()
    print("\n✅ Project uploaded to GitHub successfully!")