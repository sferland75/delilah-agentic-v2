import { AssessmentFormData, CoreAssessment, Form1Assessment, CATAssessment } from '../../../types/assessment';

export interface BaseFormProps {
  formData: AssessmentFormData;
  onFormChange: (data: AssessmentFormData) => void;
  children?: React.ReactNode;
}

export interface BaseFormChildProps {
  data: AssessmentFormData;
  onCoreChange: (fieldPath: keyof CoreAssessment, value: any) => void;
  onForm1Change: (value: Form1Assessment) => void;
  onCATChange: (value: CATAssessment) => void;
}