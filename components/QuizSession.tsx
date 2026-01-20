
import React, { useState } from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { CheckCircle2, XCircle, ChevronRight, ArrowLeft, Zap, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-bold uppercase text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            <span>Leave Session</span>
          </button>
          <div className="flex flex-col items-center">
             <span className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Quiz</span>
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
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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

          {/* New "Next Question" Position (Immediately after options) */}
          <div className="mb-10 flex justify-end">
            {!isAnswered ? (
              <Button size="lg" onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full md:w-auto rounded-[2rem] py-5 px-10 text-lg shadow-xl shadow-indigo-100">
                Check Answer
              </Button>
            ) : (
              <Button size="lg" onClick={handleNext} className="w-full md:w-auto rounded-[2rem] py-5 px-10 text-lg shadow-xl shadow-indigo-100 bg-slate-900 text-white hover:bg-indigo-600">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>

          {isAnswered && (
            <div className="space-y-10 animate-in fade-in slide-in-from-top-4">
              {/* Specific Trigger Analysis */}
              <div className="bg-slate-50 rounded-[2.5rem] p-8 border-l-[12px] border-indigo-600 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                  <Zap className="w-24 h-24 text-indigo-900" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-indigo-600 rounded-lg text-white">
                      <Zap className="w-5 h-5" />
                   </div>
                  <span className="font-black uppercase tracking-[0.2em] text-indigo-800 text-xs">Explanation (Trigger)</span>
                </div>
                <div className="space-y-4 relative z-10">
                  <p className="text-slate-800 text-xl font-bold leading-tight">
                    This sentence requires the <span className="text-indigo-600 underline decoration-indigo-200 decoration-4 underline-offset-4">{currentQuestion.grammarTopic}</span>.
                  </p>
                  <p className="text-slate-600 font-medium italic bg-white p-5 rounded-2xl border border-slate-100 shadow-sm leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              {/* Comprehensive Grammar Deep Dive */}
              <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="bg-slate-900 px-10 py-8 text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-400 rounded-2xl text-slate-900">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">Knowledge Base</h3>
                      <h4 className="text-2xl font-black tracking-tight">{currentQuestion.grammarTopic}</h4>
                    </div>
                  </div>
                  <BookOpen className="w-8 h-8 text-slate-600 opacity-50" />
                </div>

                <div className="p-8 md:p-14">
                  <div className="flex items-start gap-4 mb-12 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                    <Lightbulb className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-blue-900 font-black text-sm uppercase tracking-widest mb-1">DELE B2 Mastery Notes</p>
                      <p className="text-blue-800 text-sm font-medium leading-relaxed">
                        Examine the logic and conjugation patterns below to master this specific grammar point.
                      </p>
                    </div>
                  </div>

                  <article className="prose prose-slate prose-lg max-w-none 
                    prose-h1:text-xl prose-h1:font-black prose-h1:text-indigo-600 prose-h1:uppercase prose-h1:tracking-[0.2em] prose-h1:mb-6 prose-h1:mt-12 prose-h1:border-b-2 prose-h1:border-indigo-50 prose-h1:pb-2
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-8 prose-p:font-medium prose-p:text-lg
                    prose-strong:text-slate-900 prose-strong:font-black
                    prose-table:w-full prose-table:my-10 prose-table:border-collapse prose-table:rounded-3xl prose-table:overflow-hidden prose-table:border prose-table:border-slate-100 prose-table:shadow-lg
                    prose-thead:bg-slate-900 prose-thead:text-white
                    [&_thead_th]:text-white! [&_thead_th]:p-5 [&_thead_th]:text-center [&_thead_th]:font-black [&_thead_th]:text-xs [&_thead_th]:uppercase [&_thead_th]:tracking-widest
                    prose-td:p-5 prose-td:text-center prose-td:border-b prose-td:border-slate-50 prose-td:font-black prose-td:text-slate-800 prose-td:bg-white
                    prose-ul:list-disc prose-ul:pl-6 prose-li:mb-3 prose-li:text-slate-600 prose-li:font-medium">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{referenceText}</ReactMarkdown>
                  </article>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
