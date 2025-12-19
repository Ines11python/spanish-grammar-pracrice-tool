
import React, { useState } from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { CheckCircle2, XCircle, ChevronRight, ArrowLeft, Info, BookOpen } from 'lucide-react';
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
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswered(true);
    setAnswers([...answers, isCorrect]);
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
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">
      {/* Quiz Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onCancel} className="flex items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Quit Quiz</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-indigo-600">{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-800">
              {currentQuestion.sentence.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className={`inline-block border-b-4 mx-2 min-w-[100px] text-center px-2 transition-colors ${
                      isAnswered 
                        ? (selectedOption === currentQuestion.correctAnswer ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600')
                        : 'border-indigo-100'
                    }`}>
                      {selectedOption || '...'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedOption;
              
              let btnClass = "flex items-center p-5 rounded-2xl border-2 transition-all text-left ";
              if (!isAnswered) {
                btnClass += isSelected 
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100" 
                  : "border-slate-100 bg-white hover:border-slate-200 text-slate-600";
              } else {
                if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700";
                else if (isSelected) btnClass += "border-red-500 bg-red-50 text-red-700";
                else btnClass += "border-slate-50 bg-white opacity-40";
              }

              return (
                <button key={option} onClick={() => !isAnswered && setSelectedOption(option)} disabled={isAnswered} className={btnClass}>
                  <span className="font-bold text-lg">{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="ml-auto w-6 h-6 text-green-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="ml-auto w-6 h-6 text-red-500" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                <Info className="w-5 h-5" />
                <span>Explanation</span>
              </div>
              <p className="text-slate-600 leading-relaxed italic">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {!isAnswered ? (
              <Button size="lg" onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full md:w-auto">
                Check Answer
              </Button>
            ) : (
              <Button size="lg" onClick={handleNext} className="w-full md:w-auto">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grammar Reference Section */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8 text-indigo-600">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-800">Study Guide: {currentQuestion.grammarTopic}</h3>
        </div>
        
        <article className="prose prose-slate max-w-none prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-3 prose-td:p-3 prose-th:border prose-td:border prose-headings:text-slate-800 prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{referenceText}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
};
