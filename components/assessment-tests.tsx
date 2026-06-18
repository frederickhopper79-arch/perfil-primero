"use client";

import { useState } from "react";
import { testQuestions } from "@/lib/domain/catalogs";

type Scores = {
  english: number;
  spanish: number;
  personality: number;
};

function scoreLabel(key: keyof Scores, score: number): string {
  if (score === 0) return "Sin completar";
  if (key === "english") {
    if (score >= 91) return "C2 · Maestría";
    if (score >= 76) return "C1 · Avanzado";
    if (score >= 61) return "B2 · Intermedio alto";
    if (score >= 41) return "B1 · Intermedio";
    if (score >= 21) return "A2 · Básico";
    return "A1 · Principiante";
  }
  if (key === "spanish") {
    if (score >= 85) return "Experto";
    if (score >= 65) return "Avanzado";
    if (score >= 40) return "Intermedio";
    return "Básico";
  }
  if (key === "personality") {
    if (score >= 80) return "Proactivo";
    if (score >= 60) return "Colaborativo";
    if (score >= 40) return "Metódico";
    return "Independiente";
  }
  return `${score}%`;
}

export function AssessmentTests({
  scores,
  attemptCounts,
  onChange
}: {
  scores: Scores;
  attemptCounts?: { english: number; spanish: number; personality: number };
  onChange: (scores: Scores) => void;
}) {
  type Answers = Record<keyof Scores, Record<string, number>>;
  const pages: Array<{ key: keyof Scores; title: string; description: string }> = [
    { key: "personality", title: "Evaluación conductual laboral", description: "Identifica valores de trabajo, colaboración, responsabilidad y reacción ante situaciones de presión o conflicto." },
    { key: "english", title: "Test de inglés laboral", description: "Evalúa gramática, vocabulario y redacción profesional en contextos de trabajo reales, con niveles A2 a C1." },
    { key: "spanish", title: "Test de español profesional", description: "Evalúa comprensión, ortografía funcional y comunicación escrita con clientes, equipos y proveedores." }
  ];
  const [activeTest, setActiveTest] = useState<keyof Scores | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    english: {},
    spanish: {},
    personality: {}
  });

  function resetTest(test: keyof Scores) {
    setAnswers((current) => ({ ...current, [test]: {} }));
    onChange({ ...scores, [test]: 0 });
    setActiveTest(test);
  }

  function answer(test: keyof Scores, questionIndex: number, optionIndex: number) {
    const question = testQuestions[test][questionIndex];
    setAnswers((current) => {
      const nextAnswers = {
        ...current,
        [test]: {
          ...current[test],
          [question.id]: optionIndex
        }
      };
      const correct = testQuestions[test].filter((item) => nextAnswers[test][item.id] === item.answer).length;
      onChange({
        ...scores,
        [test]: Math.min(100, Math.round((correct / testQuestions[test].length) * 100))
      });
      return nextAnswers;
    });
  }

  const allCompleted = scores.english > 0 && scores.spanish > 0 && scores.personality > 0;

  return (
    <section className="assessmentSuite">
      <div className="formHeader">
        <div className="miniIconText">T</div>
        <div>
          <h2>Tests de validación</h2>
          <p>Resultados visibles para empresas verificadas, sin exponer tu identidad.</p>
        </div>
      </div>
      <div className="assessmentWarning">
        Estos tests son una señal orientativa inicial. No son diagnóstico psicológico,
        certificación de idioma ni evaluación psicométrica formal.
      </div>
      {allCompleted && (
        <div className="validatedBadge">
          <span className="validatedIcon">✓</span>
          <div>
            <strong>Perfil validado</strong>
            <p>Completaste los tres tests. Tu perfil destaca entre los demás postulantes.</p>
          </div>
        </div>
      )}
      {!activeTest ? (
        <div className="assessmentCatalog">
          {pages.map((item, index) => {
            const count = attemptCounts?.[item.key] ?? 0;
            const completed = scores[item.key] > 0;
            return (
              <article className={`assessmentLauncher launcher${index + 1}`} key={item.key}>
                <div className="assessmentArt">
                  <span>{index + 1}</span>
                </div>
                <div>
                  <span className="smallLabel">
                    {completed ? scoreLabel(item.key, scores[item.key]) : "Opcional · sin completar"}
                    {count > 0 && <span className="attemptBadge">{count} {count === 1 ? "intento" : "intentos"}</span>}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul>
                    <li>Resultado visible solo dentro del perfil</li>
                    <li>Sirve como señal inicial, no como certificación formal</li>
                    <li>Puedes repetirlo para mejorar tu resultado</li>
                  </ul>
                </div>
                <div className="launcherActions">
                  <button className="button primary" type="button" onClick={() => setActiveTest(item.key)}>
                    {completed ? "Continuar test" : "Realizar test"}
                  </button>
                  {completed && (
                    <button className="button secondary" type="button" onClick={() => resetTest(item.key)}>
                      Reintentar desde cero
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="testGrid independentTests">
          {pages.filter((item) => item.key === activeTest).map((item) => (
          <TestForm
            description={item.description}
            key={item.key}
            title={item.title}
            test={item.key}
            score={scores[item.key]}
            selectedAnswers={answers[item.key]}
            onAnswer={answer}
            onBack={() => setActiveTest(null)}
          />
          ))}
        </div>
      )}
    </section>
  );
}

function TestForm({
  title,
  description,
  test,
  score,
  selectedAnswers,
  onAnswer,
  onBack
}: {
  title: string;
  description: string;
  test: keyof Scores;
  score: number;
  selectedAnswers: Record<string, number>;
  onAnswer: (test: keyof Scores, questionIndex: number, optionIndex: number) => void;
  onBack: () => void;
}) {
  const questions = testQuestions[test];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <form className="testCard independentTest" onSubmit={(event) => event.preventDefault()}>
      <div className="testHeader">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <strong>{score > 0 ? scoreLabel(test, score) : "—"}</strong>
      </div>
      <button className="button secondary" type="button" onClick={onBack}>Volver a tests</button>
      <span className="testProgress">Avance {answeredCount}/{questions.length}</span>
      {questions.map((question, questionIndex) => (
        <div className="questionBlock" key={question.id}>
          {"competency" in question ? <span>{question.competency}</span> : null}
          <p>{question.prompt}</p>
          <div className="optionRow">
            {question.options.map((option, optionIndex) => (
              <button
                className={selectedAnswers[question.id] === optionIndex ? "optionButton selected" : "optionButton"}
                key={option}
                type="button"
                onClick={() => onAnswer(test, questionIndex, optionIndex)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </form>
  );
}
