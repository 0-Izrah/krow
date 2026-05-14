import { useState } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRoutines } from "../hooks/useRoutines";
import { useExercises } from "../hooks/useExercises";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { PasteRoutineModal } from "../components/ui/PasteRoutineModal";

// Sortable exercise item component
function SortableExerciseItem({ config, onRemove, getExerciseName, onUpdate }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: config.exerciseId });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="bg-grind-bg rounded-xl p-3 cursor-grab active:cursor-grabbing"
			{...attributes}
			{...listeners}
		>
			<div className="flex items-start justify-between mb-2">
				<p className="text-grind-text text-sm font-medium flex-1">
					{getExerciseName(config.exerciseId)}
				</p>
				<button
					onPointerDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.stopPropagation();
						onRemove(config.exerciseId);
					}}
					className="text-grind-muted hover:text-red-400 text-lg ml-2 leading-none p-1"
				>
					×
				</button>
			</div>
			<div className="grid grid-cols-3 gap-2">
				{/* Sets — always shown */}
				<div>
					<label className="text-grind-muted text-xs">Sets</label>
					<input
						type="number"
						value={config.sets}
						onPointerDown={(e) => e.stopPropagation()}
						onChange={(e) => onUpdate(config.exerciseId, 'sets', e.target.value)}
						className="w-full bg-grind-card border border-grind-border rounded-lg px-2 py-1 text-grind-text text-sm outline-none mt-0.5"
					/>
				</div>

				{/* Reps OR Duration depending on type */}
				{config.type === 'time' ? (
					<div>
						<label className="text-grind-muted text-xs">Seconds</label>
						<input
							type="number"
							value={config.duration}
							onPointerDown={(e) => e.stopPropagation()}
							onChange={(e) => onUpdate(config.exerciseId, 'duration', e.target.value)}
							className="w-full bg-grind-card border border-grind-border rounded-lg px-2 py-1 text-grind-text text-sm outline-none mt-0.5"
						/>
					</div>
				) : (
					<div>
						<label className="text-grind-muted text-xs">Reps</label>
						<input
							type="number"
							value={config.reps}
							onPointerDown={(e) => e.stopPropagation()}
							onChange={(e) => onUpdate(config.exerciseId, 'reps', e.target.value)}
							className="w-full bg-grind-card border border-grind-border rounded-lg px-2 py-1 text-grind-text text-sm outline-none mt-0.5"
						/>
					</div>
				)}

				{/* Rest — always shown */}
				<div>
					<label className="text-grind-muted text-xs">Rest (s)</label>
					<input
						type="number"
						value={config.restSeconds}
						onPointerDown={(e) => e.stopPropagation()}
						onChange={(e) => onUpdate(config.exerciseId, 'restSeconds', e.target.value)}
						className="w-full bg-grind-card border border-grind-border rounded-lg px-2 py-1 text-grind-text text-sm outline-none mt-0.5"
					/>
				</div>
			</div>

			{/* Type indicator */}
			<p className="text-grind-muted text-xs mt-2">
				{config.type === 'time' ? '⏱ Time-based' : '🔢 Rep-based'}
			</p>
		</div>
	);
}

const DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export function Routines() {
	const { routines, addRoutine, deleteRoutine, updateRoutine } = useRoutines();
	const { exercises } = useExercises();
	const [isOpen, setIsOpen] = useState(false);
	const [isPasteOpen, setIsPasteOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [routineToDelete, setRoutineToDelete] = useState(null);
	const [exerciseSearch, setExerciseSearch] = useState("");
	const [form, setForm] = useState({
		name: "",
		days: [],
		selectedExercises: [],
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			distance: 8,
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const oldIndex = form.selectedExercises.findIndex(
				(e) => e.exerciseId === active.id,
			);
			const newIndex = form.selectedExercises.findIndex(
				(e) => e.exerciseId === over.id,
			);
			setForm((p) => ({
				...p,
				selectedExercises: arrayMove(
					p.selectedExercises,
					oldIndex,
					newIndex,
				),
			}));
		}
	};

	const toggleDay = (day) => {
		setForm((p) => ({
			...p,
			days: p.days.includes(day)
				? p.days.filter((d) => d !== day)
				: [...p.days, day],
		}));
	};

	const addExerciseToRoutine = (exerciseId) => {
		if (form.selectedExercises.find((e) => e.exerciseId === exerciseId))
			return;
		const exercise = exercises.find((e) => e.id === exerciseId);
		const isTime = exercise?.type === 'time';

		setForm((p) => ({
			...p,
			selectedExercises: [
				...p.selectedExercises,
				{
					exerciseId,
					type : isTime ? 'time' : 'reps',
					sets: 3,
					reps: isTime ? null : 12,
					duration : isTime ? 30 : null,
					restSeconds: 30,
				},
			],
		}));
	};

	const removeExerciseFromRoutine = (exerciseId) => {
		setForm((p) => ({
			...p,
			selectedExercises: p.selectedExercises.filter(
				(e) => e.exerciseId !== exerciseId,
			),
		}));
	};

	const updateExerciseConfig = (exerciseId, field, value) => {
		setForm((p) => ({
			...p,
			selectedExercises: p.selectedExercises.map((e) =>
				e.exerciseId === exerciseId
					? { ...e, [field]: Number(value) }
					: e,
			),
		}));
	};

	const handleSave = () => {
		if (!form.name.trim()) return;
		
		if (editingId) {
			updateRoutine(editingId, {
				name: form.name,
				days: form.days,
				exerciseIds: form.selectedExercises,
			});
		} else {
			addRoutine({
				name: form.name,
				days: form.days,
				exerciseIds: form.selectedExercises,
			});
		}
		
		setForm({ name: "", days: [], selectedExercises: [] });
		setIsOpen(false);
		setEditingId(null);
	};

	const getExerciseName = (id) =>
		exercises.find((e) => e.id === id)?.name || "Unknown";

	return (
		<div className="pt-8 pb-4 space-y-5">
			<div className="flex items-center justify-between">
				<h1 className="font-display text-4xl tracking-wider">
					ROUTINES
				</h1>
				<div className="flex gap-2">
					<Button variant="ghost" onClick={() => setIsPasteOpen(true)} className="!bg-grind-card">Paste Note</Button>
					<Button onClick={() => {
						setEditingId(null);
						setForm({ name: "", days: [], selectedExercises: [] });
						setIsOpen(true);
					}}>+ New</Button>
				</div>
			</div>

			{isPasteOpen && (
				<PasteRoutineModal 
					exercises={exercises} 
					onSave={(routine) => addRoutine({
						name: routine.name,
						days: [],
						exerciseIds: routine.exercises.map(ex => ({
							exerciseId: ex.exerciseId,
							sets: ex.plannedSets,
							reps: ex.targetReps,
							rest: 60
						}))
					})} 
					onClose={() => setIsPasteOpen(false)} 
				/>
			)}

			{routines.length === 0 ? (
				<div className="text-center py-16 text-grind-muted">
					<p className="text-4xl mb-3">📋</p>
					<p>No routines yet. Build your first one.</p>
				</div>
			) : (
				<div className="space-y-3">
					{routines.map((routine) => (
						<Card key={routine.id}>
							<div className="flex items-start justify-between">
								<div>
									<h2 className="font-display text-2xl tracking-wide text-grind-text">
										{routine.name}
									</h2>
									<p className="text-grind-muted text-xs mt-0.5">
										{routine.exerciseIds.length} exercises
									</p>
									<div className="flex flex-wrap gap-1 mt-2">
										{routine.days.map((day) => (
											<Badge key={day}>
												{day.slice(0, 3)}
											</Badge>
										))}
									</div>
								</div>
								<div className="flex gap-4">
									<button
										onClick={() => {
											setEditingId(routine.id);
											setForm({
												name: routine.name,
												days: routine.days,
												selectedExercises: routine.exerciseIds,
											});
											setIsOpen(true);
										}}
										className="text-grind-muted hover:text-grind-accent text-sm font-medium transition-colors"
									>
										Edit
									</button>
									<button
										onClick={() => {
											setRoutineToDelete(routine);
										}}
										className="text-grind-muted hover:text-red-400 text-lg leading-none transition-colors"
									>
										×
									</button>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			<Modal
				isOpen={isOpen}
				onClose={() => {
					setIsOpen(false);
					setEditingId(null);
					setForm({ name: "", days: [], selectedExercises: [] });
				}}
				title={editingId ? "Edit Routine" : "New Routine"}
			>
				<div className="space-y-5">
					{/* Name */}
					<div>
						<label className="text-grind-muted text-xs block mb-1">
							Routine Name
						</label>
						<input
							type="text"
							placeholder="e.g. Shoulder Day"
							value={form.name}
							onChange={(e) =>
								setForm((p) => ({ ...p, name: e.target.value }))
							}
							className="w-full bg-grind-bg border border-grind-border rounded-xl px-3 py-2.5 text-grind-text text-sm outline-none focus:border-grind-accent"
						/>
					</div>

					{/* Days */}
					<div>
						<label className="text-grind-muted text-xs block mb-2">
							Days
						</label>
						<div className="flex flex-wrap gap-2">
							{DAYS.map((day) => (
								<button
									key={day}
									onClick={() => toggleDay(day)}
									className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
										form.days.includes(day)
											? "bg-grind-accent text-black"
											: "bg-grind-border text-grind-muted"
									}`}
								>
									{day.slice(0, 3)}
								</button>
							))}
						</div>
					</div>

					{/* Add Exercises */}
					<div>
						<label className="text-grind-muted text-xs block mb-2">
							Add Exercises
						</label>
						{exercises.length === 0 ? (
							<p className="text-grind-muted text-sm">
								No exercises in library yet.
							</p>
						) : (
						<>
							<input
								type="text"
								placeholder="Search exercises..."
								value={exerciseSearch}
								onChange={(e) => setExerciseSearch(e.target.value)}
								className="w-full bg-grind-bg border border-grind-border rounded-lg px-2 py-2 text-grind-text text-sm outline-none focus:border-grind-accent mb-2"
							/>
							<div className="space-y-1 max-h-40 overflow-y-auto">
								{exercises.filter(ex => ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())).map((ex) => {
									const isAdded = form.selectedExercises.find(
										(e) => e.exerciseId === ex.id,
									);
									return (
										<div
											key={ex.id}
											className="flex items-center justify-between py-1"
										>
											<span className="text-grind-text text-sm">
												{ex.name}
											</span>
											<button
												onClick={() =>
													isAdded
														? removeExerciseFromRoutine(
																ex.id,
															)
														: addExerciseToRoutine(
																ex.id,
															)
												}
												className={`text-xs px-2 py-1 rounded-lg transition-colors ${
													isAdded
														? "bg-red-900 text-red-200"
														: "bg-grind-border text-grind-muted hover:text-grind-text"
												}`}
											>
												{isAdded ? "Remove" : "+ Add"}
											</button>
										</div>
									);
								})}
							</div>
						</>
					)}
				</div>

					{/* Configure Selected Exercises */}
					{form.selectedExercises.length > 0 && (
						<div>
							<label className="text-grind-muted text-xs block mb-2">
								Configure (drag to reorder)
							</label>
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
							<SortableContext
								items={form.selectedExercises.map(
									(e) => e.exerciseId,
								)}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-3">
									{form.selectedExercises.map((config) => (
										<SortableExerciseItem
											key={config.exerciseId}
											config={config}
											onRemove={
												removeExerciseFromRoutine
											}
											getExerciseName={getExerciseName}
											onUpdate={updateExerciseConfig}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
						</div>
					)}

					<Button
						onClick={handleSave}
						className="w-full"
						disabled={!form.name.trim()}
					>
						Save Routine
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={!!routineToDelete}
				onClose={() => setRoutineToDelete(null)}
				title="Delete Routine?"
			>
				<div className="space-y-4">
					<p className="text-grind-text text-sm">
						Are you sure you want to permanently delete "{routineToDelete?.name}"?
					</p>
					<div className="flex gap-3 pt-2">
						<Button
							onClick={() => setRoutineToDelete(null)}
							className="flex-1 !bg-grind-card !text-grind-text border border-grind-border"
						>
							Cancel
						</Button>
						<Button
							variant="danger"
							onClick={() => {
								deleteRoutine(routineToDelete.id);
								setRoutineToDelete(null);
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
