import { z } from "zod";

export const signInInput = z.object({
	email: z.email(),
	password: z.string().min(8, "At least 8 characters"),
});
export type SignInInput = z.infer<typeof signInInput>;

export const signUpInput = signInInput.extend({
	name: z.string().trim().min(2, "At least 2 characters").max(80),
});
export type SignUpInput = z.infer<typeof signUpInput>;
