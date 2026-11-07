import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";
import { ApiError, type FieldErrors } from "./errors";

function toFieldErrors(issues: readonly z.core.$ZodIssue[]): FieldErrors {
	const fieldErrors: FieldErrors = {};
	for (const issue of issues) {
		// Dotted path for nested fields ("items.0.price"); "root" for errors on the whole object
		const key = issue.path.map(String).join(".") || "root";
		fieldErrors[key] ??= [];
		fieldErrors[key].push(issue.message);
	}
	return fieldErrors;
}

/**
 * `zValidator` that throws `ApiError` (422 problem+json) instead of returning Zod's raw error.
 * Because the hook throws, no validator-specific error type is added to the RPC types;
 * the shared error shape comes from `ApplyGlobalResponse` in app.ts.
 */
export const validator = <T extends z.ZodType, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T,
) =>
	zValidator(target, schema, (result) => {
		if (!result.success) {
			throw ApiError.validation(toFieldErrors(result.error.issues), `Invalid request ${target}`);
		}
	});
