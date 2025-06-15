
import { useState, useEffect } from "react";
import { toast } from "sonner";

/**
 * Catches and displays Row Level Security (RLS) or permission errors
 * Returns: { rlsError, setRlsError }
 */
export const useRLSGuard = () => {
  const [rlsError, setRlsError] = useState<string | null>(null);

  useEffect(() => {
    if (rlsError) {
      if (typeof rlsError === "string" && rlsError.match(/no row-level|row-level security policy/i)) {
        toast.error(
          "Your account does not have access to this organizational data. Please contact your admin if you believe this is a mistake."
        );
      } else {
        toast.error(rlsError);
      }
    }
  }, [rlsError]);

  return { rlsError, setRlsError };
};
