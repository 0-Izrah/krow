import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";

export function PwaPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [isDismissed, setIsDismissed] = useState(false);

	useEffect(() => {
		const handler = (e) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault();
			// Stash the event so it can be triggered later.
			setDeferredPrompt(e);
		};

		window.addEventListener("beforeinstallprompt", handler);

		return () => {
			window.removeEventListener("beforeinstallprompt", handler);
		};
	}, []);

	if (!deferredPrompt || isDismissed) return null;

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		
		// Show the install prompt
		deferredPrompt.prompt();
		
		// Wait for the user to respond to the prompt
		const { outcome } = await deferredPrompt.userChoice;
		
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
	};

	return (
		<div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
			<Card className="flex items-center gap-4 bg-grind-card/95 backdrop-blur-md shadow-[0_0_20px_rgba(200,255,0,0.15)] border-grind-accent/50 p-4">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xl">📱</span>
						<h4 className="text-grind-text font-bold">Install Krow</h4>
					</div>
					<p className="text-grind-muted text-xs leading-relaxed">
						Add to your home screen for a seamless native app experience.
					</p>
				</div>
				<div className="flex flex-col gap-2 shrink-0 w-24">
					<Button onClick={handleInstall} className="text-xs py-1.5 px-3">
						Install
					</Button>
					<button 
						onClick={() => setIsDismissed(true)} 
						className="text-grind-muted text-xs hover:text-white transition-colors"
					>
						Not now
					</button>
				</div>
			</Card>
		</div>
	);
}
