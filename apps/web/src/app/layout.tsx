import "@repo/ui/globals.css";
import { cn } from "@repo/ui/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
	title: "Machinery Marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
			<body className="min-h-dvh">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
