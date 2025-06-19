# GitHub Actions Workflows for CODAC

This directory contains GitHub Actions workflows designed to facilitate open source collaboration, especially for beginner developers. These workflows automate many aspects of project maintenance and provide helpful guidance to contributors.

## 🚀 Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests

**Purpose:** Ensures code quality and successful builds

**What it does:**

- **Lint & Type Check**: Runs ESLint and TypeScript checks
- **Build**: Verifies the application builds successfully
- **Security Audit**: Checks for security vulnerabilities (non-blocking)
- **Dependency Check**: Identifies outdated dependencies (non-blocking)
- **PR Size Analysis**: Comments on large PRs with guidance

**Benefits for beginners:**

- Immediate feedback on code quality
- Prevents broken code from being merged
- Educational comments about PR best practices

### 2. Welcome New Contributors (`welcome-newcomers.yml`)

**Triggers:** First-time PR or issue creation

**Purpose:** Welcome and guide new contributors

**What it does:**

- Detects first-time contributors
- Posts welcoming messages with helpful resources
- Adds labels to identify new contributors
- Provides step-by-step guidance for next steps

**Benefits for beginners:**

- Reduces intimidation factor for first contributions
- Provides clear guidance on what to expect
- Links to helpful resources and documentation

### 3. Auto Label Issues and PRs (`auto-label.yml`)

**Triggers:** Issues/PRs opened or edited

**Purpose:** Automatically categorize contributions

**What it does:**

- Analyzes content and changed files
- Applies appropriate labels (type, area, priority, difficulty)
- Helps with issue/PR organization
- Identifies good first issues

**Benefits for beginners:**

- Helps them find appropriate issues to work on
- Provides structure and organization
- Makes it easier to understand project areas

### 4. Stale Issues Management (`stale-issues.yml`)

**Triggers:** Daily schedule, manual trigger

**Purpose:** Keep the repository clean and active

**What it does:**

- Marks inactive issues/PRs as stale
- Closes stale items after additional time
- Cleans up old branches from closed PRs
- Maintains repository hygiene

**Benefits for beginners:**

- Reduces overwhelming number of open issues
- Keeps focus on active, relevant issues
- Provides clear communication about closure

### 5. Dependency Updates (`dependency-updates.yml`)

**Triggers:** Weekly schedule, manual trigger

**Purpose:** Keep dependencies secure and up-to-date

**What it does:**

- Checks for outdated dependencies
- Creates/updates dependency update issues
- Runs security audits
- Provides detailed guidance for updates

**Benefits for beginners:**

- Good first issues for learning dependency management
- Detailed instructions for safe updates
- Security awareness education

### 6. PR Reviewer Assignment (`pr-reviewer-assignment.yml`)

**Triggers:** PR opened or ready for review

**Purpose:** Guide PR review process

**What it does:**

- Analyzes changed files and suggests appropriate reviewers
- Provides PR summary and categorizes changes
- Offers checklists for authors and reviewers
- Gives testing instructions

**Benefits for beginners:**

- Educational review checklists
- Clear testing guidance
- Encouragement and support messages

## 🔧 Configuration & Customization

### Required Setup

1. **Repository Settings:**

   - Ensure GitHub Actions are enabled
   - Grant necessary permissions for workflows

2. **Repository Labels:**
   The workflows expect these labels to exist:

   ```
   type: bug, type: feature, type: documentation, type: security, type: dependencies
   area: ui, area: api, area: database, area: editor, area: community
   priority: low, priority: medium, priority: high
   difficulty: beginner, difficulty: intermediate, difficulty: advanced
   good first issue, help wanted, needs-review, stale
   size: small, size: medium, size: large
   ```

3. **Create Labels Script:**
   You can create these labels automatically using the GitHub CLI:

   ```bash
   # Install GitHub CLI and authenticate first

   # Type labels
   gh label create "type: bug" --color "d73a4a" --description "Something isn't working"
   gh label create "type: feature" --color "a2eeef" --description "New feature or request"
   gh label create "type: documentation" --color "0075ca" --description "Improvements or additions to documentation"
   gh label create "type: security" --color "b60205" --description "Security vulnerability or concern"
   gh label create "type: dependencies" --color "0366d6" --description "Dependency updates"
   gh label create "type: question" --color "d876e3" --description "Further information is requested"

   # Area labels
   gh label create "area: ui" --color "fef2c0" --description "User interface components"
   gh label create "area: api" --color "c5def5" --description "API and backend functionality"
   gh label create "area: database" --color "f9d0c4" --description "Database related changes"
   gh label create "area: editor" --color "d4c5f9" --description "Rich text editor functionality"
   gh label create "area: community" --color "c2e0c6" --description "Community features"

   # Priority labels
   gh label create "priority: low" --color "0e8a16" --description "Low priority"
   gh label create "priority: medium" --color "fbca04" --description "Medium priority"
   gh label create "priority: high" --color "d93f0b" --description "High priority"

   # Difficulty labels
   gh label create "difficulty: beginner" --color "7057ff" --description "Good for newcomers"
   gh label create "difficulty: intermediate" --color "a2eeef" --description "Moderate complexity"
   gh label create "difficulty: advanced" --color "d876e3" --description "High complexity"

   # Status labels
   gh label create "good first issue" --color "7057ff" --description "Good for newcomers"
   gh label create "help wanted" --color "008672" --description "Extra attention is needed"
   gh label create "needs-review" --color "fbca04" --description "Needs review from maintainers"
   gh label create "stale" --color "ededed" --description "No recent activity"

   # Size labels
   gh label create "size: small" --color "20B2AA" --description "Small changes"
   gh label create "size: medium" --color "DAA520" --description "Medium changes"
   gh label create "size: large" --color "FF6347" --description "Large changes"
   ```

### Customizing Workflows

#### Reviewer Assignment (`pr-reviewer-assignment.yml`)

Update the `reviewerMap` object with actual GitHub usernames:

```javascript
const reviewerMap = {
  ui: ["your-ui-expert-username"],
  api: ["your-backend-expert-username"],
  database: ["your-database-expert-username"],
  docs: ["your-docs-maintainer-username"],
  tests: ["your-testing-expert-username"],
};
```

#### Repository Owner Check

Several workflows include `if: github.repository_owner == 'codeacademyberlin'`
Update this to match your organization/username:

```yaml
if: github.repository_owner == 'your-org-name'
```

#### Stale Issue Timing

Adjust the timing in `stale-issues.yml`:

```yaml
days-before-stale: 30 # Mark as stale after X days
days-before-close: 7 # Close after X more days
days-before-pr-stale: 21 # PRs become stale faster
days-before-pr-close: 7 # Close PRs after X more days
```

## 📋 Issue Templates

The `.github/ISSUE_TEMPLATE/` directory contains structured templates:

- **Bug Report** (`bug_report.yml`): Detailed bug reporting form
- **Feature Request** (`feature_request.yml`): Comprehensive feature suggestion form
- **Question** (`question.yml`): Help and support request form

These templates guide users to provide comprehensive information, making it easier for maintainers and other contributors to help.

## 🎯 Best Practices for Maintainers

### 1. Regular Monitoring

- Check workflow runs weekly for failures
- Review automatically created issues (dependencies, security)
- Respond to new contributor questions promptly

### 2. Label Management

- Keep labels consistent and meaningful
- Train team members on labeling conventions
- Regularly review and clean up unused labels

### 3. Encouraging Contributions

- Regularly mark appropriate issues as "good first issue"
- Respond positively to new contributors
- Provide constructive feedback on PRs

### 4. Workflow Updates

- Keep GitHub Actions versions updated
- Monitor for new helpful actions in the marketplace
- Adjust workflows based on team feedback

## 🆘 Troubleshooting

### Common Issues

**Workflow not triggering:**

- Check if GitHub Actions are enabled in repository settings
- Verify the workflow file syntax is valid YAML
- Ensure the trigger conditions are met

**Permission errors:**

- Check that the `GITHUB_TOKEN` has necessary permissions
- For organization repos, verify Actions permissions

**Label creation failures:**

- Manually create required labels if the script fails
- Check label names match exactly what workflows expect

**Too many notifications:**

- Adjust workflow conditions to reduce noise
- Consider using `continue-on-error: true` for non-critical steps

### Getting Help

If you encounter issues with these workflows:

1. Check the Actions tab in your repository for error details
2. Review the workflow files for configuration issues
3. Consult GitHub Actions documentation
4. Ask questions in GitHub Community discussions

## 🔄 Contributing to Workflows

These workflows are designed to be community-maintained. If you have improvements:

1. Test changes thoroughly in a fork first
2. Document any new configuration requirements
3. Update this README with changes
4. Consider backward compatibility

**Remember:** These workflows are meant to help, not hinder. If they become burdensome, adjust them to fit your community's needs!
