#!/bin/bash

# 1. Update assessment types to match form usage
echo "Fixing assessment types..."
cd frontend/src/types
git mv assessment.ts assessment.old.ts
cat > assessment.ts << 'EOL'
export enum AssessmentType {
    INITIAL = 'initial',
    FOLLOW_UP = 'followUp',
    DISCHARGE = 'discharge'
}

export interface CoreAssessment {
    clientInfo: {
        demographics: any;  // TODO: Define proper type
    };
    functionalStatus: {
        adl: any;  // TODO: Define proper type
        mobility: any;
    };
    homeEnvironment: {
        safety: string[];
        modifications: string[];
    };
    recommendations: {
        immediate: string[];
        followUp: string[];
    };
}

export interface AssessmentFormData {
    id?: string;
    clientId: string;
    assessmentType: AssessmentType;
    status: 'draft' | 'pending' | 'completed';
    core?: CoreAssessment;
}

export type { ClinicalInfo, EmergencyContact, FunctionalStatus, HomeEnvironment, Recommendations } from './assessment.old';
EOL

# 2. Add path alias to vite config
echo "Updating Vite config..."
cd ../..
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
EOL

# 3. Create validation utility
echo "Creating validation utility..."
mkdir -p src/utils
cat > src/utils/assessment.ts << 'EOL'
import { AssessmentFormData, AssessmentType } from '../types/assessment';

export const createEmptyAssessmentData = (): AssessmentFormData => ({
    clientId: '',
    assessmentType: AssessmentType.INITIAL,
    status: 'draft',
    core: {
        clientInfo: {
            demographics: {}
        },
        functionalStatus: {
            adl: {},
            mobility: {}
        },
        homeEnvironment: {
            safety: [],
            modifications: []
        },
        recommendations: {
            immediate: [],
            followUp: []
        }
    }
});
EOL

# 4. Update package.json to ensure types are available
echo "Updating package.json..."
jq '.dependencies["@types/react"] = "^18.2.48"' package.json > package.json.tmp && mv package.json.tmp package.json

# 5. Create index.ts for types
echo "Creating type index..."
cat > src/types/index.ts << 'EOL'
export * from './assessment';
export * from './client';
export * from './validation';
EOL

git add .
git commit -m "fix: resolve TypeScript configuration and type definition issues

- Update assessment types to match form implementation
- Add proper path aliases
- Create validation utilities
- Ensure proper type exports
- Update dependencies"
EOL