# Developer Guide

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Installation
```bash
git clone [repository-url]
cd delilah-agentic
npm install
```

### Development Server
```bash
npm run dev
```

## Project Structure
```
/src
  /components
    /assessment        # Assessment-related components
    /clients          # Client management components
    /common           # Shared components
    /layout          # Layout components
  /contexts          # React contexts
  /services          # API services
  /types             # TypeScript definitions
  /hooks             # Custom React hooks
  /utils             # Utility functions
```

## Key Components

### Assessment Form
The main assessment interface that follows the OT workflow:
1. Client Information
2. Primary Concerns
3. Functional Assessment
4. Environmental Assessment
5. Goals & Recommendations

### Component Example
```typescript
import React from 'react';
import { AssessmentFormData } from '@types/assessment';

const AssessmentForm: React.FC = () => {
  // Component implementation
};
```

## Working with Types

### Assessment Types
```typescript
export enum AssessmentType {
    INITIAL = 'INITIAL',
    FOLLOW_UP = 'FOLLOW_UP',
    DISCHARGE = 'DISCHARGE'
}

export interface AssessmentData {
    // Type definition
}
```

## API Integration

### Service Structure
```typescript
class AssessmentService {
    async create(data: AssessmentFormData): Promise<AssessmentData> {
        // Implementation
    }
}
```

## Testing

### Running Tests
```bash
npm test
```

### Testing Strategy
1. Component unit tests
2. Integration tests
3. End-to-end testing

## Styling Guidelines

### Tailwind Usage
- Use utility classes for styling
- Create reusable components for common patterns
- Follow mobile-first approach

### Example
```jsx
<div className="max-w-4xl mx-auto py-6">
  <h1 className="text-2xl font-bold mb-6">
    Title
  </h1>
</div>
```

## Best Practices

### Code Organization
- One component per file
- Keep components focused and small
- Use TypeScript interfaces for props
- Document complex logic

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries
- Show user-friendly error messages

### Performance
- Implement lazy loading where appropriate
- Use React.memo for expensive components
- Optimize re-renders

## Documentation

### Component Documentation
```typescript
/**
 * AssessmentForm - Main assessment entry form
 * 
 * @component
 * @example
 * return (
 *   <AssessmentForm />
 * )
 */
```

### Type Documentation
```typescript
/**
 * Represents an assessment's data structure
 * @interface
 */
export interface AssessmentData {
    // Interface definition
}
```

## Git Workflow

### Branch Naming
- feature/[feature-name]
- bugfix/[bug-description]
- hotfix/[issue-description]

### Commit Messages
```
feat: Add assessment form validation
fix: Resolve type import issues
docs: Update developer guide
```

## Deployment

### Build
```bash
npm run build
```

### Environment Variables
```env
REACT_APP_API_URL=http://api.example.com
REACT_APP_VERSION=$npm_package_version
```

## Troubleshooting

### Common Issues
1. Type import failures
2. Path resolution problems
3. Build compilation errors

### Solutions
1. Check tsconfig.json paths
2. Verify file locations
3. Update import statements