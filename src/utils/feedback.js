export const playDing = () => {
	try {
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		if (!AudioContext) return;

		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gainNode = ctx.createGain();

		osc.type = "sine";
		osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
		osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

		gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

		osc.connect(gainNode);
		gainNode.connect(ctx.destination);

		osc.start();
		osc.stop(ctx.currentTime + 0.5);
	} catch (e) {
		console.warn("Audio not supported or blocked", e);
	}
};

export const vibrate = (pattern) => {
	if (typeof navigator !== "undefined" && navigator.vibrate) {
		try {
			navigator.vibrate(pattern);
		} catch (e) {
			console.warn("Vibration not supported", e);
		}
	}
};
