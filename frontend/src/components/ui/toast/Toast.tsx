import React from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { Alert, AlertTitle } from '../Alert';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ToastMessage } from '@/types/toast';

interface Props {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: Props) {
  return (
    <Alert
      variant={toast.variant}
      className="w-96 shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <AlertTitle className="text-sm font-medium">
            {toast.message}
          </AlertTitle>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}

export default Toast;