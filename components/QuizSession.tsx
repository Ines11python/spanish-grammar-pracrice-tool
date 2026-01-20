
import React, { useState } from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { CheckCircle2, XCircle, ChevronRight, ArrowLeft, Info, BookOpen, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuizSessionProps {
  questions: Question[];
  referenceText: string;
  onFinish: (score: number, answers: boolean[]) => void;
  onCancel: () => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({ questions, referenceText, onFinish, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswered(true);
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    if (isCorrect) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onFinish(score, answers);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-bold uppercase text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            <span>Abandonar</span>
          </button>
          <div className="flex flex-col items-center">
             <span className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Question</span>
             <span className="text-2xl font-black text-slate-800">{currentIndex + 1} <span className="text-slate-300 font-medium">/</span> {questions.length}</span>
          </div>
          <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 -z-10" />
          
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {currentQuestion.grammarTopic}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-slate-800">
              {currentQuestion.sentence.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className={`inline-block border-b-[6px] mx-3 min-w-[140px] text-center px-4 transition-all pb-1 ${
                      isAnswered 
                        ? (selectedOption === currentQuestion.correctAnswer ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600')
                        : 'border-indigo-100 text-indigo-600 italic'
                    }`}>
                      {selectedOption || '...'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedOption;
              
              let btnClass = "flex items-center p-6 rounded-3xl border-[3px] transition-all text-left font-black text-xl ";
              if (!isAnswered) {
                btnClass += isSelected 
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 scale-[1.02]" 
                  : "border-slate-50 bg-white hover:border-slate-200 text-slate-600";
              } else {
                if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700";
                else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700";
                else btnClass += "border-slate-50 bg-white opacity-30 grayscale";
              }

              return (
                <button key={option} onClick={() => !isAnswered && setSelectedOption(option)} disabled={isAnswered} className={btnClass}>
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="ml-auto w-6 h-6 text-green-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="ml-auto w-6 h-6 text-red-500" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
              {/* Question Specific Explanation */}
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-4 text-indigo-700 font-black uppercase tracking-widest text-sm">
                  <Info className="w-5 h-5" />
                  <span>¿Por qué esta respuesta?</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium italic text-lg">{currentQuestion.explanation}</p>
              </div>

              {/* General Grammar Reference */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <BookOpen className="w-48 h-48" />
                </div>

                <div className="flex items-center gap-4 mb-8 text-indigo-600 relative z-10">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Conceptos Clave</h3>
                    <h4 className="text-2xl font-black tracking-tight text-slate-800">Understanding {currentQuestion.grammarTopic}</h4>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 mb-8 flex gap-4 items-start relative z-10">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-amber-800 text-sm">Don't know what this is?</p>
                    <p className="text-amber-700 text-sm">Review the guide below to learn the rules and conjugation patterns for this time tense.</p>
                  </div>
                </div>

                <article className="prose prose-slate prose-base max-w-none relative z-10
                  prose-table:w-full prose-table:rounded-2xl prose-table:overflow-hidden prose-table:border-hidden prose-table:shadow-sm
                  prose-thead:bg-slate-900 prose-thead:text-white
                  prose-th:px-4 prose-th:py-3 prose-th:text-left
                  prose-td:px-4 prose-td:py-3 prose-td:border-b prose-td:border-slate-100
                  prose-headings:text-slate-800 prose-headings:font-black
                  prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-indigo-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{referenceText}</ReactMarkdown>
                </article>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-end">
            {!isAnswered ? (
              <Button size="lg" onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full md:w-auto rounded-[2rem] py-6 px-12 text-xl shadow-xl shadow-indigo-100">
                Check Answer
              </Button>
            ) : (
              <Button size="lg" onClick={handleNext} className="w-full md:w-auto rounded-[2rem] py-6 px-12 text-xl shadow-xl shadow-indigo-100">
                {currentIndex < questions.length - 1 ? 'Continuar' : 'Finalizar Lab'}
                <ChevronRight className="ml-2 w-6 h-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
