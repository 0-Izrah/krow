import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { supabase } from "../utils/supabase";
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Settings() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [username, setUsername] = useState("");
	const [pin, setPin] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");


    const [weight, setWeight] = useLocalStorage('user_weight'); // kg
    const [height, setHeight] = useLocalStorage('user_height'); // cm
    const [age, setAge] = useLocalStorage('user_age');
    const [gender, setGender] = useLocalStorage('user_gender');

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			setUser(data?.user || null);
			setLoading(false);
		});
	}, []);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!username || !pin) {
			setError("Username and PIN are required.");
			return;
		}

		const fakeEmail = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@krow.sync`;

		try {
			// First try to sign in
			let { data, error: signInError } =
				await supabase.auth.signInWithPassword({
					email: fakeEmail,
					password: pin,
				});

			if (signInError) {
				// If invalid credentials - might need to create account
				if (
					signInError.message.includes("Invalid login credentials") ||
					signInError.status === 400
				) {
					const { data: signUpData, error: signUpError } =
						await supabase.auth.signUp({
							email: fakeEmail,
							password: pin,
						});
					if (signUpError) throw signUpError;
					data = signUpData;
				} else {
					throw signInError;
				}
			}

			if (data?.user) {
				setUser(data.user);
				setSuccess("Successfully connected to sync server!");
			}
		} catch (err) {
			setError(err.message || "Failed to connect.");
		}
	};

const handleLogout = async () => {
        // 1. Sign out of the cloud
        await supabase.auth.signOut();
        
        // 2. Wipe all local app data (keeping only Supabase internal keys if any linger)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && !k.startsWith('sb-') && !k.startsWith('__')) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));

        setUser(null);
        setSuccess("Disconnected. Wiping local device data...");

        // 3. Force a hard reload of the app to clear React's internal memory/hooks
        setTimeout(() => {
            window.location.href = '/';
        }, 800);
    };

	const handleManualSyncPush = async () => {
		if (!user) return;
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const allData = {};
			for (let i = 0; i < localStorage.length; i++) {
				const k = localStorage.key(i);
				const v = localStorage.getItem(k);
				if (v && !k.startsWith("__") && !k.startsWith("sb-")) {
					try {
						allData[k] = JSON.parse(v);
					} catch (e) {
						allData[k] = v;
					}
				}
			}

			const dbPayload = {
				user_id: user.id,
				local_data: allData,
				updated_at: new Date().toISOString(),
			};

			const { error } = await supabase.from('user_sync').upsert(dbPayload, { onConflict: 'user_id' });
			if (error) throw error;

			setSuccess(
				`✅ Synced successfully! Data keys: ${Object.keys(allData).join(", ")}`,
			);
		} catch (err) {
			setError(
				err.message ||
					"Failed to sync data. Ensure your Supabase table is set up.",
			);
		}
		setLoading(false);
	};

	const handleManualSyncPull = async () => {
		if (!user) return;
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			// Simple query without column specification
			const { data, error } = await supabase
				.from("user_sync")
				.select()
				.eq("user_id", user.id);

			if (error) throw error;

			if (data && data.length > 0) {
				// local_data contains our combined keys (e.g. { "exercises": [], "logs": [] })
				const syncData = data[0].local_data;
				if (syncData && typeof syncData === "object") {
					Object.entries(syncData).forEach(([k, v]) => {
						// Never restore Supabase auth tokens from the cloud
						if (!k.startsWith("sb-") && !k.startsWith("__")) {
							localStorage.setItem(k, JSON.stringify(v));
						}
					});
				}
				setSuccess(
					"Data successfully pulled from cloud. Refresh the app to see it.",
				);
			} else {
				setSuccess("No cloud data found.");
			}
		} catch (err) {
			setError(
				err.message ||
					"Failed to pull data (may be normal on first login).",
			);
		}
		setLoading(false);
	};

	if (loading) return <div className="pt-8 px-4 text-center">Loading...</div>;

	return (
		<div className="pt-8 pb-4 space-y-5">
			<h1 className="font-display text-4xl tracking-wider">SETTINGS</h1>

			<Card className="p-6">
				<h2 className="text-xl tracking-wider font-bold mb-4 font-display">
					CLOUD SYNC
				</h2>

				{user ? (
					<div className="space-y-4">
						<div className="bg-grind-accent/10 text-grind-accent p-3 rounded text-sm mb-4">
							✅ Connected as{" "}
							<span className="font-bold">
								{user.email.split("@")[0]}
							</span>
						</div>

						<p className="text-xs text-grind-muted leading-relaxed">
							Your workouts are automatically saved locally and
							synchronized to the cloud when connected.
						</p>

						<div className="flex flex-col gap-3 mt-4">
							<Button
								variant="primary"
								onClick={handleManualSyncPush}
								disabled={loading}
							>
								🔄 Test Sync Now
							</Button>
							<Button
								variant="ghost"
								onClick={handleManualSyncPull}
								disabled={loading}
								className="!bg-grind-card"
							>
								⬇️ Force Pull from Cloud
							</Button>
							<Button
								variant="ghost"
								onClick={handleLogout}
								className="border border-red-500/50 text-red-500 hover:bg-red-500/10"
							>
								Disconnect
							</Button>
						</div>
					</div>
				) : (
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-1">
							<label className="text-xs text-grind-muted uppercase tracking-wider font-bold">
								Username
							</label>
							<input
								type="text"
								className="w-full bg-black border border-grind-border rounded p-3 text-white focus:border-grind-accent outline-none"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="e.g. grindking99"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-xs text-grind-muted uppercase tracking-wider font-bold">
								Secret PIN
							</label>
							<input
								type="password"
								className="w-full bg-black border border-grind-border rounded p-3 text-white focus:border-grind-accent outline-none"
								value={pin}
								onChange={(e) => setPin(e.target.value)}
								placeholder="6+ characters min"
							/>
							<p className="text-[10px] text-grind-muted">
								If the user doesn't exist, we'll create it
								instantly!
							</p>
						</div>

						<Button
							type="submit"
							className="w-full mt-4"
							variant="primary"
						>
							Connect & Sync
						</Button>
					</form>
				)}

				{error && (
					<div className="mt-4 p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs rounded">
						{error}
					</div>
				)}
				{success && (
					<div className="mt-4 p-3 bg-grind-accent/10 border border-grind-accent text-grind-accent text-xs rounded">
						{success}
					</div>
				)}
			</Card>
            <Card className="p-6 mb-5">
                <h2 className="text-xl tracking-wider font-bold mb-4 font-display">BIOMETRICS</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs text-grind-muted uppercase tracking-wider font-bold">Weight (kg)</label>
                        <input 
                            type="number"
                            className="w-full bg-black border border-grind-border rounded p-3 text-white focus:border-grind-accent outline-none"
                            value={weight}
                            onChange={e => setWeight(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-grind-muted uppercase tracking-wider font-bold">Height (cm)</label>
                        <input 
                            type="number"
                            className="w-full bg-black border border-grind-border rounded p-3 text-white focus:border-grind-accent outline-none"
                            value={height}
                            onChange={e => setHeight(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-grind-muted uppercase tracking-wider font-bold">Age</label>
                        <input 
                            type="number"
                            className="w-full bg-black border border-grind-border rounded p-3 text-white focus:border-grind-accent outline-none"
                            value={age}
                            onChange={e => setAge(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-grind-muted uppercase tracking-wider font-bold">Gender</label>
                        <select 
                            className="w-full bg-black border border-grind-border rounded p-3 text-white focus:border-grind-accent outline-none appearance-none"
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
                <p className="text-[10px] text-grind-muted leading-relaxed">
                    Used to calculate your precise Basal Metabolic Rate (BMR) for highly accurate energy tracking.
                </p>
            </Card>

			{/* {user && (
                <Card className="p-6">
                    <h2 className="text-xl tracking-wider font-bold mb-4 font-display">LOCAL DATA</h2>
                    <div className="bg-black p-3 rounded border border-grind-border text-[11px] font-mono text-grind-muted max-h-40 overflow-y-auto space-y-1">
                        {Array.from({ length: localStorage.length }, (_, i) => {
                            const key = localStorage.key(i);
                            if (key && !key.startsWith('__') && !key.startsWith('sb-')) {
                                const value = localStorage.getItem(key);
                                try {
                                    const parsed = JSON.parse(value);
                                    const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed || {}).length;
                                    return (
                                        <div key={key}>
                                            <span className="text-grind-accent">{key}:</span> {count} items
                                        </div>
                                    );
                                } catch (e) {
                                    return <div key={key}><span className="text-grind-accent">{key}:</span> (string)</div>;
                                }
                            }
                            return null;
                        })}
                    </div>
                </Card>
            )} */}
		</div>
	);
}
