
// Patch this stub so it does not reference missing tables or APIs

// Provide stubs for main hooks for build
export const useInquiryData = () => {
  return {
    inquiries: [],
    isLoading: false,
    error: null
  };
};

// Stubs for hooks used in Inquiries.tsx
export const useInquiries = () => ({
  data: [],
  isLoading: false,
  isRefetching: false,
  refetch: () => {},
});

export const useAssignInquiry = () => ({
  isPending: false,
  mutate: (_args: any, { onSuccess }: any = {}) => {
    if (onSuccess) onSuccess();
  },
});
