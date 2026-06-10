import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { flashcardAnswer, flashcardKey, flashcardPrompt } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function FlashcardStudyMode({ cards }) {
  const flashcardIndex = useFocusRoomStore(state => state.flashcardIndex);
  const flashcardSide = useFocusRoomStore(state => state.flashcardSide);
  const flashcardProgress = useFocusRoomStore(state => state.flashcardProgress);
  const setFlashcardIndex = useFocusRoomStore(state => state.setFlashcardIndex);
  const flipFlashcard = useFocusRoomStore(state => state.flipFlashcard);
  const rateFlashcard = useFocusRoomStore(state => state.rateFlashcard);
  const completed = useFocusRoomStore(state => Object.values(state.flashcardProgress || {})
    .filter(item => item && item.difficulty)
    .length);
  const total = cards.length;
  const index = Math.min(Math.max(flashcardIndex, 0), Math.max(0, total - 1));
  const card = cards[index];
  const key = flashcardKey(card, index);
  const progress = flashcardProgress[key] || {};
  const side = flashcardSide === "back" ? "back" : "front";

  return (
    <article className="study-card liquid-glass-lite">
      <span className="focus-kicker">Card {index + 1} of {total}</span>
      <h3>{side === "back" ? "Answer" : "Prompt"}</h3>
      <p>{side === "back" ? flashcardAnswer(card) : flashcardPrompt(card, index)}</p>
      {progress.difficulty ? <span className="focus-pill">Marked {progress.difficulty}</span> : null}
      <div className="focus-button-row">
        <GlassButton disabled={index <= 0} onClick={() => setFlashcardIndex(index - 1)}>Previous</GlassButton>
        <GlassButton variant="primary" onClick={flipFlashcard}>{side === "back" ? "Show Prompt" : "Reveal Answer"}</GlassButton>
        <GlassButton disabled={index >= total - 1} onClick={() => setFlashcardIndex(index + 1)}>Next</GlassButton>
      </div>
      <div className="focus-button-row">
        {["easy", "medium", "hard"].map(difficulty => (
          <GlassButton
            key={difficulty}
            variant={progress.difficulty === difficulty ? "primary" : "ghost"}
            onClick={() => rateFlashcard(difficulty)}
          >
            Mark {difficulty}
          </GlassButton>
        ))}
      </div>
      <p>{completed} completed in this material.</p>
    </article>
  );
}
