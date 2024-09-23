# Get the current branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Add all changes
git add .

# Prompt for a commit message
echo "Enter your commit message:"
read COMMIT_MESSAGE

# Commit changes with the provided message
git commit -m "$COMMIT_MESSAGE"

# Check if the branch has an upstream branch set
if git rev-parse --abbrev-ref --symbolic-full-name @{u} > /dev/null 2>&1; then
    # If upstream is set, just push
    git push origin $BRANCH
else
    # If upstream is not set, set it and push
    git push --set-upstream origin $BRANCH
fi

echo "Changes have been committed and pushed to $BRANCH"