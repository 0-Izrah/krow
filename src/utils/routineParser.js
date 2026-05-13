export function parsePastedRoutine(text, allExercises) {
    const lines = text.split('\n');
    let routineName = "Imported Routine";
    const exercisesFound = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Expanded RegEx to find patterns like "3x10", "3 x 10", "3 sets of 10", "3x8-10", "3 * 10", "3 by 12"
        const setRepRegex = /(?:^|\s|\(|-|\:)(\d+)\s*(?:x|\*|sets?(?:\s+of)?|by)?\s*(\d+(?:-\d+)?)(?:\s|$|\)|reps?)/i;
        let match = trimmed.match(setRepRegex);
        
        let sets = 3;
        let reps = "10";
        let nameCandidate = trimmed;

        if (match) {
            sets = parseInt(match[1], 10);
            reps = match[2];
            nameCandidate = trimmed.replace(match[0], '').trim();
        } else {
            // Check reverse like "12 reps 3 sets"
            const revPattern = /(\d+(?:-\d+)?)\s*reps?\s*(?:x|\*|for|in)?\s*(\d+)\s*sets?/i;
            const revMatch = trimmed.match(revPattern);
            if (revMatch) {
                reps = revMatch[1];
                sets = parseInt(revMatch[2], 10);
                nameCandidate = trimmed.replace(revMatch[0], '').trim();
                match = revMatch; // Just to indicate we found numbers
            }
        }

        // Clean up the leftover text
        nameCandidate = nameCandidate.replace(/^[-\:\.]\s*/, '').replace(/[-\:\.]$/, '').replace(/[\(\)]/g, '').trim();

        // If it's the very first text line and has no numbers, assume it's the routine name
        if (index === 0 && !match) {
            routineName = trimmed;
            return;
        }

        if (nameCandidate.length < 2 && !match) return; // Skip garbage lines

        // Smarter fuzzy match
        let bestMatch = null;
        let highestScore = 0;

        const leftLow = nameCandidate.toLowerCase();
        
        allExercises?.forEach(ex => {
            const exLow = ex.name.toLowerCase();
            let score = 0;
            
            if (leftLow === exLow) score = 1.0;
            else if (leftLow.includes(exLow)) score = 0.9;
            else if (exLow.includes(leftLow)) score = 0.8;
            else {
                // Check word by word hit rate
                const words = leftLow.split(/\s+/).filter(w => w.length > 2);
                if (words.length > 0) {
                    let matches = 0;
                    words.forEach(w => {
                        if (exLow.includes(w)) matches++;
                    });
                    score = (matches / words.length) * 0.5;
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = ex;
            }
        });

        // If score is decent, we accept it as matched. Or if we at least found a set/rep scheme, log it as unmatched.
        if (highestScore > 0.2) {
            exercisesFound.push({
                exerciseId: bestMatch.id,
                importedName: nameCandidate || trimmed,
                matchedName: bestMatch.name,
                plannedSets: sets,
                targetReps: reps
            });
        } else if (match) {
            exercisesFound.push({
                exerciseId: 'unknown',
                importedName: nameCandidate || trimmed,
                matchedName: null,
                plannedSets: sets,
                targetReps: reps
            });
        }
    });

    return {
        id: "routine-" + Date.now(),
        name: routineName,
        exercises: exercisesFound
    };
}

