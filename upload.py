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
    run_cmd("git add .")
    run_cmd(f'git commit -m "{COMMIT_MESSAGE}"')

def set_git_remote_and_push():
    # Check if remote exists
    remotes = subprocess.check_output("git remote", shell=True).decode().split()
    if "origin" in remotes:
        run_cmd(f"git remote set-url origin {GITHUB_SSH_URL}")
    else:
        run_cmd(f"git remote add origin {GITHUB_SSH_URL}")
    
    # Set branch and push
    run_cmd(f"git branch -M {BRANCH_NAME}")
    run_cmd(f"git push -u origin {BRANCH_NAME}")

# ---- EXECUTION ----
if __name__ == "__main__":
    print("🚀 Uploading your React project to GitHub via SSH...")
    
    # Git ignore best practices
    if not os.path.exists(".gitignore"):
        with open(".gitignore", "w") as f:
            f.write("node_modules/\nbuild/\n.env\n")

    git_init_and_commit()
    set_git_remote_and_push()

    print("✅ Project uploaded successfully!")
