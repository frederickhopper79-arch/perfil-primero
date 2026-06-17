"use client";

import { useState } from "react";
import { testQuestions } from "@/lib/domain/catalogs";

type Scores = {
  english: number;
  spanish: number;
  personality: number;
};

export function AssessmentTests({
  scores,
  onChange
}: {
  scores: Scores;
  onChange: (scores: Scores) => void;
}) {
  type Answers = Record<keyof Scores, Record<string, number>>;
  const pages: Array<{ key: keyof Scores; title: string; description: string }> = [
    { key: "personality", title: "Perfil laboral conductual", description: "Identifica valores de trabajo, colaboracion, responsabilidad y reaccion ante presion." },
    { key: "english", title: "Test de ingles laboral", description: "Evalua lectura, vocabulario y redaccion profesional base para contextos de trabajo." },
    { key: "spanish", title: "Test de espanol profesional", description: "Evalua comprension, ortografia funcional y comunicacion con clientes o equipos." }
  ];
  const [activeTest, setActiveTest] = useState<keyof Scores | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    english: {},
    spanish: {},
    personality: {}
  });

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

  return (
    <section className="assessmentSuite">
      <div className="formHeader">
        <div className="miniIconText">T</div>
        <div>
          <h2>Tests de validacion</h2>
          <p>Resultados visibles para empresas, sin exponer identidad.</p>
        </div>
      </div>
      <div className="assessmentWarning">
        Estos tests son una senal inicial de seleccion. No son diagnostico psicologico,
        certificacion de idioma ni evaluacion psicometrica formal.
      </div>
      {!activeTest ? (
        <div className="assessmentCatalog">
          {pages.map((item, index) => (
            <article className={`assessmentLauncher launcher${index + 1}`} key={item.key}>
              <div className="assessmentArt">
                <span>{index + 1}</span>
              </div>
              <div>
                <span className="smallLabel">{scores[item.key] ? `Resultado ${scores[item.key]}%` : "Opcional"}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ul>
                  <li>Resultado visible solo dentro del perfil</li>
                  <li>Sirve como senal inicial, no como certificacion formal</li>
                  <li>Puede repetirse antes de publicar cambios</li>
                </ul>
              </div>
              <button className="button primary" type="button" onClick={() => setActiveTest(item.key)}>
                Realizar test
              </button>
            </article>
          ))}
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
        <strong>{score}%</strong>
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
