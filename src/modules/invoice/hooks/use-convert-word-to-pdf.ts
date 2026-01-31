import { useMutation } from '@tanstack/react-query';
import { invoiceApis } from '../apis';
import type { ConvertWordToPdfPayload } from '../types/payload';

export const useConvertWordToPdf = () => {
   const mutation = useMutation({
    mutationFn: async ({file}: ConvertWordToPdfPayload) => invoiceApis.convertToPdf(file),
  });

  const convertToPdf = (variables: ConvertWordToPdfPayload) => {
    return mutation.mutateAsync(variables);
  };
  
  return {
    convertToPdf,
    ...mutation,
  };
};
