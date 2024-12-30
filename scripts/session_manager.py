#!/usr/bin/env python3
import os
import sys
from datetime import datetime
import subprocess
import json

def check_git_status():
    """Check git status and return any uncommitted changes."""
    result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
    return result.stdout.strip()

def update_tracking_file():
    """Update the development tracking file with session info."""
    tracking_file = '../docs/DEVELOPMENT_TRACKING.md'
    with open(tracking_file, 'r') as f:
        content = f.read()
    
    # Update last modified date
    content = content.replace(
        'Last Updated: ',
        f'Last Updated: {datetime.now().strftime("%B %d, %Y")}'
    )
    
    with open(tracking_file, 'w') as f:
        f.write(content)

def start_session():
    """Initialize a new development session."""
    print("Starting new development session...")
    
    # Check git status
    changes = check_git_status()
    if changes:
        print("Warning: You have uncommitted changes:")
        print(changes)
        input("Press Enter to continue...")
    
    # Pull latest changes
    subprocess.run(['git', 'pull', 'origin', 'main'])
    
    # Update tracking
    update_tracking_file()
    
    # Check environment
    subprocess.run(['python', '../check_env.py'])
    
    print("\nSession started successfully!")
    print("Don't forget to:")
    print("1. Review DEVELOPMENT_TRACKING.md")
    print("2. Check for new issues/PRs")
    print("3. Create a new feature branch if needed")

def end_session():
    """Clean up and document current session."""
    print("Ending development session...")
    
    # Check for uncommitted changes
    changes = check_git_status()
    if changes:
        print("\nYou have uncommitted changes:")
        print(changes)
        choice = input("Would you like to commit these changes? (y/n): ")
        if choice.lower() == 'y':
            message = input("Enter commit message: ")
            subprocess.run(['git', 'add', '.'])
            subprocess.run(['git', 'commit', '-m', message])
    
    # Update tracking file
    update_tracking_file()
    
    print("\nSession ended successfully!")
    print("Don't forget to:")
    print("1. Push any commits")
    print("2. Update documentation if needed")
    print("3. Close any completed issues")

if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1] not in ['start', 'end']:
        print("Usage: python session_manager.py [start|end]")
        sys.exit(1)
    
    if sys.argv[1] == 'start':
        start_session()
    else:
        end_session()