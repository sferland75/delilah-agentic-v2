# Contributing to Delilah Agentic

## Current Development Focus (December 2024)

### Core Features
1. In-Home Assessment Types:
   - Basic IHA
   - IHA + Form 1 Assessment
   - IHA for CAT Designation
   - IHA + SIT for CAT Designation

2. Assessment Sections:
   - Demographics
   - ADL Assessment
   - Clinical Documentation
   - Environmental Evaluation
   - Documentation Management
   - Recommendations

### Development Workflow

1. Branch Strategy
```bash
main        # Production code
develop     # Development integration
feature/*   # Feature branches
```

2. Feature Development
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Regular commits
git add .
git commit -m "feat: description of change"

# Push changes
git push origin feature/your-feature-name
```

3. Pull Requests
- Create PR against develop branch
- Add clear description of changes
- Reference any related issues
- Ensure all tests pass
- Request code review

### Code Standards

1. TypeScript
- Use strict mode
- Define interfaces for all data structures
- Use proper type imports

2. React Components
- Functional components with hooks
- Props interface definitions
- Proper state management

3. Styling
- Use Tailwind CSS classes
- Follow component style structure
- Keep styles modular

### Testing
- Write unit tests for new components
- Update existing tests when modifying
- Ensure test coverage for edge cases

### Documentation
- Update relevant .md files
- Document new components
- Add inline documentation
- Update type definitions

### Getting Help
- Check existing documentation first
- Ask in team chat for clarification
- Tag relevant team members in PRs
