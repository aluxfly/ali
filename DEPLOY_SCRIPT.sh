#!/bin/bash
# GitHub Pages Deployment Script for Project Radar
# Run this script to deploy the static site to GitHub Pages

set -e

REPO_DIR="/home/admin/.openclaw/workspace-technician/projects/project-radar"
cd "$REPO_DIR"

echo "📦 Deploying Project Radar to GitHub Pages..."

# Ensure we're on gh-pages branch
git checkout gh-pages

# Add all files
git add -A

# Commit
git commit -m "Deploy project radar static site" || echo "No changes to commit"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin gh-pages --force

echo ""
echo "✅ Deployment complete!"
echo "🌐 Website URL: https://aluxfly.github.io/ali/"
echo ""
echo "To enable GitHub Pages:"
echo "1. Go to https://github.com/aluxfly/ali/settings/pages"
echo "2. Select 'gh-pages' branch as source"
echo "3. Click Save and wait 1-2 minutes"
