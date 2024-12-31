#!/bin/bash

# Stage the changes
git add frontend/src/validation/assessmentValidation.ts
git add frontend/src/components/common/ErrorBoundary.tsx
git add frontend/src/components/common/FormErrorDisplay.tsx
git add frontend/src/components/assessment/AssessmentForm.tsx
git add frontend/src/components/assessment/sections/index.tsx

# Commit the changes
git commit -m "feat: update assessment form implementation

- Add comprehensive form validation
- Implement error boundary and error display components
- Update form sections with proper error handling
- Add loading states and submission handling
- Update section navigation with error indicators"