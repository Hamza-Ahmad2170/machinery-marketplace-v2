import { z } from "zod";

/** HTTP statuses the API answers with an error body. The server's RPC error types are built from this list. */
export const apiErrorStatuses = [400, 401, 403, 404, 409, 422, 429, 500] as const;
export type ApiErrorStatus = (typeof apiErrorStatuses)[number];

/**
 * Stable, machine-readable error codes. Clients branch on `code` and translate it; `detail` is for humans.
 * Add a feature code (e.g. "LISTING_NOT_FOUND") when a client needs to tell that error apart.
 */
export const errorCodes = [
	"BAD_REQUEST",
	"UNAUTHORIZED",
	"FORBIDDEN",
	"NOT_FOUND",
	"CONFLICT",
	"VALIDATION_FAILED",
	"RATE_LIMITED",
	"INTERNAL_ERROR",
] as const;
export type ErrorCode = (typeof errorCodes)[number];

/** Validation messages per field, keyed by dotted path ("items.0.price"). "root" is the object itself. */
export type FieldErrors = Record<string, string[]>;

/**
 * Every API error body: RFC 9457 Problem Details (`application/problem+json`) plus two extensions,
 * `code` and, for validation failures, `fieldErrors`.
 */
export const problemDetails = z.object({
	type: z.string(),
	title: z.string(),
	status: z.int(),
	detail: z.string().optional(),
	instance: z.string().optional(),
	code: z.enum(errorCodes),
	fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});
export type ProblemDetails = z.infer<typeof problemDetails>;
