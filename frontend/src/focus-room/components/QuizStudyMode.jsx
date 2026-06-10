import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import {
  isFocusQuizAnswerPresent,
  questionChoices,
  questionText,
  quizAnswerMatchesChoice
} from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function QuizStudyMode({ questions }) {
  const quizAnswers = useFocusRoomStore(state => state.quizAnswers);
  const quizChecked = useFocusRoomStore(state => state.quizChecked);
  const answerQuizQuestion = useFocusRoomStore(state => state.answerQuizQuestion);
  const checkQuizQuestion = useFocusRoomStore(state => state.checkQuizQuestion);
  const score = useFocusRoomStore(state => {
    const checked = Object.values(state.quizChecked || {}).filter(item => item && item.hasKnownAnswer);
    if (!checked.length) return null;
    return Math.round((checked.filter(item => item.correct).length / checked.length) * 100);
  });

  return (
    <div className="quiz-stack">
      {score === null ? null : <span className="focus-pill">Current score {score}%</span>}
      {questions.map((question, index) => {
        const answer = quizAnswers[index];
        const checked = quizChecked[index] || null;
        const choices = questionChoices(question);
        const textAnswer = typeof answer === "string" ? answer : "";
        const hasAnswer = isFocusQuizAnswerPresent(question, answer);
        return (
          <article className="quiz-card liquid-glass-lite" key={`${questionText(question, index)}-${index}`}>
            <span className="focus-kicker">{question.quizTitle || "Quiz"} / Question {index + 1}</span>
            <h3>{questionText(question, index)}</h3>
            {choices.length ? (
              <div className="focus-button-row">
                {choices.map((choice, choiceIndex) => (
                  <GlassButton
                    key={choice}
                    variant={quizAnswerMatchesChoice(question, answer, choiceIndex) ? "primary" : "ghost"}
                    onClick={() => answerQuizQuestion(index, choiceIndex)}
                  >
                    {choice}
                  </GlassButton>
                ))}
              </div>
            ) : (
              <textarea
                className="answer-input"
                value={textAnswer}
                onChange={event => answerQuizQuestion(index, event.target.value)}
              />
            )}
            <GlassButton variant="primary" disabled={!hasAnswer} onClick={() => checkQuizQuestion(index)}>
              Check answer
            </GlassButton>
            {checked ? (
              <p>
                {checked.hasKnownAnswer ? (checked.correct ? "Correct" : "Review this one") : "Answer saved for review"}
                {checked.explanation ? ` - ${checked.explanation}` : ""}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
