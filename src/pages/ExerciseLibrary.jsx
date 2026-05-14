import { useState } from "react";
import { useExercises } from "../hooks/useExercises";
import { getYoutubeEmbedUrl, isValidYoutubeUrl } from "../utils/youtube";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";

const MUSCLE_GROUPS = [
	"Chest",
	"Shoulders",
	"Back",
	"Arms",
	"Core",
	"Legs",
	"Full Body",
];

const EMPTY_FORM = {
	name: "",
	muscleGroup: "Shoulders",
	youtubeUrl: "",
	notes: "",
	type: "reps",
};

export function ExerciseLibrary() {
	const { exercises, addExercise, updateExercise, deleteExercise } =
		useExercises();
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [viewExercise, setViewExercise] = useState(null);
	const [exerciseToDelete, setExerciseToDelete] = useState(null);
	const [form, setForm] = useState(EMPTY_FORM);
	const [filter, setFilter] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");

	const handleSubmit = () => {
		if (!form.name.trim()) return;
		if (editingId) {
			updateExercise(editingId, form);
		} else {
			addExercise(form);
		}
		setForm(EMPTY_FORM);
		setIsAddOpen(false);
		setEditingId(null);
	};

	const filtered = exercises.filter((ex) => {
		const matchesGroup = filter === "All" || ex.muscleGroup === filter;
		const matchesSearch = ex.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		return matchesGroup && matchesSearch;
	});

	return (
		<div className="pt-8 pb-4 space-y-5">
			<div className="flex items-center justify-between">
				<h1 className="font-display text-4xl tracking-wider">
					LIBRARY
				</h1>
				<Button
					onClick={() => {
						setEditingId(null);
						setForm(EMPTY_FORM);
						setIsAddOpen(true);
					}}
				>
					+ Add
				</Button>
			</div>

			{/* Search Input */}
			<div className="w-full">
				<input
					type="text"
					placeholder="Search exercises..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full bg-grind-bg border border-grind-border rounded-xl px-3 py-2.5 text-grind-text text-sm outline-none focus:border-grind-accent transition-colors"
				/>
			</div>

			{/* Filter Pills */}
			<div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
				{["All", ...MUSCLE_GROUPS].map((group) => (
					<button
						key={group}
						onClick={() => setFilter(group)}
						className={`
              whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${
					filter === group
						? "bg-grind-accent text-black"
						: "bg-grind-border text-grind-muted"
				}
            `}
					>
						{group}
					</button>
				))}
			</div>

			{/* Exercise Cards */}
			{filtered.length === 0 ? (
				<div className="text-center py-16 text-grind-muted">
					<p className="text-4xl mb-3">💪</p>
					<p>No exercises yet. Add one above.</p>
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((ex) => (
						<Card key={ex.id} onClick={() => setViewExercise(ex)}>
							<div className="flex items-center justify-between">
								<div className="flex-1 min-w-0">
									<p className="font-medium text-grind-text truncate">
										{ex.name}
									</p>
									<div className="flex items-center gap-2 mt-1">
										<Badge>{ex.muscleGroup}</Badge>
										{ex.youtubeUrl && (
											<Badge color="red">▶ Video</Badge>
										)}
									</div>
								</div>
								<span className="text-grind-muted ml-2">›</span>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Add Exercise Modal */}
			<Modal
				isOpen={isAddOpen}
				onClose={() => {
					setIsAddOpen(false);
					setEditingId(null);
					setForm(EMPTY_FORM);
				}}
				title={editingId ? "Edit Exercise" : "New Exercise"}
			>
				<div className="space-y-4">
					<div>
						<label className="text-grind-muted text-xs block mb-1">
							Exercise Name *
						</label>
						<input
							type="text"
							placeholder="e.g. Planche Push-up"
							value={form.name}
							onChange={(e) =>
								setForm((p) => ({ ...p, name: e.target.value }))
							}
							className="w-full bg-grind-bg border border-grind-border rounded-xl px-3 py-2.5 text-grind-text text-sm outline-none focus:border-grind-accent transition-colors"
						/>
					</div>

					<div>
						<label className="text-grind-muted text-xs block mb-1">
							Muscle Group
						</label>
						<select
							value={form.muscleGroup}
							onChange={(e) =>
								setForm((p) => ({
									...p,
									muscleGroup: e.target.value,
								}))
							}
							className="w-full bg-grind-bg border border-grind-border rounded-xl px-3 py-2.5 text-grind-text text-sm outline-none focus:border-grind-accent"
						>
							{MUSCLE_GROUPS.map((g) => (
								<option key={g}>{g}</option>
							))}
						</select>
					</div>
					<div>
						<label className="text-grind-muted text-xs block mb-2">
							Tracking Type
						</label>
						<div className="flex rounded-xl overflow-hidden border border-grind-border">
							{["reps", "time"].map((t) => (
								<button
									key={t}
									type="button"
									onClick={() =>
										setForm((p) => ({ ...p, type: t }))
									}
									className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
										form.type === t
											? "bg-grind-accent text-black"
											: "bg-grind-bg text-grind-muted"
									}`}
								>
									{t === "reps" ? "🔢 Reps" : "⏱ Time"}
								</button>
							))}
						</div>
					</div>
					<div>
						<label className="text-grind-muted text-xs block mb-1">
							YouTube URL (for visualization)
						</label>
						<input
							type="url"
							placeholder="https://youtu.be/..."
							value={form.youtubeUrl}
							onChange={(e) =>
								setForm((p) => ({
									...p,
									youtubeUrl: e.target.value,
								}))
							}
							className={`w-full bg-grind-bg border rounded-xl px-3 py-2.5 text-grind-text text-sm outline-none transition-colors ${
								form.youtubeUrl &&
								!isValidYoutubeUrl(form.youtubeUrl)
									? "border-red-700"
									: "border-grind-border focus:border-grind-accent"
							}`}
						/>
						{form.youtubeUrl &&
							!isValidYoutubeUrl(form.youtubeUrl) && (
								<p className="text-red-400 text-xs mt-1">
									Not a valid YouTube URL
								</p>
							)}
					</div>

					<div>
						<label className="text-grind-muted text-xs block mb-1">
							Notes
						</label>
						<textarea
							placeholder="Cues, tips, variations..."
							value={form.notes}
							onChange={(e) =>
								setForm((p) => ({
									...p,
									notes: e.target.value,
								}))
							}
							rows={2}
							className="w-full bg-grind-bg border border-grind-border rounded-xl px-3 py-2.5 text-grind-text text-sm outline-none focus:border-grind-accent resize-none"
						/>
					</div>

					<Button
						onClick={handleSubmit}
						className="w-full"
						disabled={!form.name.trim()}
					>
						Save Exercise
					</Button>
				</div>
			</Modal>

			{/* View Exercise Modal */}
			{viewExercise && (
				<Modal
					isOpen={!!viewExercise}
					onClose={() => setViewExercise(null)}
					title={viewExercise.name}
				>
					<div className="space-y-4">
						<Badge>{viewExercise.muscleGroup}</Badge>

						{/* YouTube Embed — the visualization solution */}
						{viewExercise.youtubeUrl &&
							getYoutubeEmbedUrl(viewExercise.youtubeUrl) && (
								<div className="rounded-xl overflow-hidden aspect-video">
									<iframe
										src={getYoutubeEmbedUrl(
											viewExercise.youtubeUrl,
										)}
										className="w-full h-full"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
										allowFullScreen
										title={viewExercise.name}
									/>
								</div>
							)}

						{viewExercise.notes && (
							<div className="bg-grind-bg rounded-xl p-3">
								<p className="text-grind-muted text-xs mb-1">
									NOTES
								</p>
								<p className="text-grind-text text-sm">
									{viewExercise.notes}
								</p>
							</div>
						)}

						<div className="flex gap-3 pt-2">
							<Button
								onClick={() => {
									setEditingId(viewExercise.id);
									setForm({
										name: viewExercise.name,
										muscleGroup: viewExercise.muscleGroup,
										youtubeUrl:
											viewExercise.youtubeUrl || "",
										notes: viewExercise.notes || "",
									});
									setViewExercise(null);
									setIsAddOpen(true);
								}}
								className="flex-1"
							>
								Edit
							</Button>
							<Button
								variant="danger"
								onClick={() => {
									setExerciseToDelete(viewExercise);
									setViewExercise(null);
								}}
								className="flex-1"
							>
								Delete
							</Button>
						</div>
					</div>
				</Modal>
			)}

			<Modal
				isOpen={!!exerciseToDelete}
				onClose={() => setExerciseToDelete(null)}
				title="Delete Exercise?"
			>
				<div className="space-y-4">
					<p className="text-grind-text text-sm">
						Are you sure you want to permanently delete "
						{exerciseToDelete?.name}"?
					</p>
					<div className="flex gap-3 pt-2">
						<Button
							onClick={() => setExerciseToDelete(null)}
							className="flex-1 !bg-grind-card !text-grind-text border border-grind-border"
						>
							Cancel
						</Button>
						<Button
							variant="danger"
							onClick={() => {
								deleteExercise(exerciseToDelete.id);
								setExerciseToDelete(null);
							}}
							className="flex-1"
						>
							Delete
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
