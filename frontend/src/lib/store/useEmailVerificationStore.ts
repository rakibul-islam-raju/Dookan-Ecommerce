import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmailVerificationState {
	pendingEmail: string | null;
	setPendingEmail: (email: string) => void;
	clearPendingEmail: () => void;
}

export const useEmailVerificationStore = create<EmailVerificationState>()(
	persist(
		(set) => ({
			pendingEmail: null,
			setPendingEmail: (email) => set({ pendingEmail: email }),
			clearPendingEmail: () => set({ pendingEmail: null }),
		}),
		{
			name: "email-verification-storage",
		}
	)
);
