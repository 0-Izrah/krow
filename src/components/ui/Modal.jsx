import { useEffect } from "react";

export function Modal({ isOpen, onClose, title, children }) {
	// Close on escape key
	useEffect(() => {
		const handleKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Sheet — slides up from bottom on mobile, centered on desktop */}
			<div className="relative w-full sm:max-w-md bg-gradient-to-b from-[#141414] to-[#0f0f0f] border border-grind-border/50 rounded-t-3xl sm:rounded-3xl p-6 z-10 max-h-[90dvh] overflow-y-auto shadow-2xl">
				<div className="flex items-center justify-between mb-6">
					<h2 className="font-display text-3xl text-white tracking-wide">
						{title}
					</h2>
					<button
						onClick={onClose}
						className="text-grind-muted hover:text-grind-accent text-2xl leading-none transition-colors"
					>
						×
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
