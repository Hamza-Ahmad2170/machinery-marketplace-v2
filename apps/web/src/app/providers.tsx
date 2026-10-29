"use client";

import { makeQueryClient } from "@repo/api-client";
import { isServer, type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (isServer) return makeQueryClient();
	browserQueryClient ??= makeQueryClient();
	return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
	return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
