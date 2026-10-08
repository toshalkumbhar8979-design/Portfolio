"use client";

import { useEffect, useState } from "react";
import { Mascot } from "page-mascot";

export function PageMascot() {
	const [isThinking, setIsThinking] = useState(false);

	useEffect(() => {
		const handleThinking = (event: Event) => {
			setIsThinking((event as CustomEvent<boolean>).detail);
		};

		window.addEventListener("portfolio-chat-thinking", handleThinking);
		return () => window.removeEventListener("portfolio-chat-thinking", handleThinking);
	}, []);

	return (
		<div className="relative">
			<Mascot
				directions="/mascots/crt-directions.webp"
				reactions="/mascots/crt-reactions.webp"
				size={112}
				label="CRT mascot"
			/>
			{isThinking && (
				<span
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 z-10 animate-pulse bg-no-repeat"
					style={{
						backgroundImage: "url('/mascots/crt-reactions.webp')",
						backgroundSize: "300% 300%",
						backgroundPosition: "50% 100%",
					}}
				/>
			)}
		</div>
	);
}
