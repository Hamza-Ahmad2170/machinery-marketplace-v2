import { z } from "zod";

export const signInInput = z.object({
	email: z.email(),
	password: z.string().min(1, "Enter your password"),
});

// Matches Better Auth's defaults: passwords are 8 to 128 characters.
export const signUpInput = z.object({
	name: z.string().trim().min(1, "Enter your name").max(100),
	email: z.email(),
	password: z.string().min(8, "Use at least 8 characters").max(128),
});

export type SignInInput = z.infer<typeof signInInput>;
export type SignUpInput = z.infer<typeof signUpInput>;
