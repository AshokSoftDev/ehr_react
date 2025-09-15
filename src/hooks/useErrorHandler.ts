'use client';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

// Custom hook for handling and displaying errors
export const useErrorHandler = (error: unknown, defaultMessage: string) => {
  useEffect(() => {
    if (error) {
      let message = defaultMessage;
      let errorToLog: any = error;

      // Check if the error is an object with a message property
      if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          const errorWithMessage = error as { message: string };
          message = errorWithMessage.message;
        }
        // For logging, we stringify the object to avoid the primitive value error
        errorToLog = JSON.stringify(error, null, 2);
      }

      // Log the stringified error to the console
      console.error(`Error: ${message}\nDetails:`, errorToLog);

      // Display a user-friendly message
      toast.error(message);
    }
  }, [error, defaultMessage]);
};
