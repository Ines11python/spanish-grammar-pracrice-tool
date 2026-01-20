
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { QuizSession } from './components/QuizSession';
import { generateSpanishQuestions, fetchGrammarReference, generateWeaknessAnalysis } from './geminiService';
import { Question, UserProgress } from './types';
import { GRAMMAR_TOPICS, INITIAL_USER_PROGRESS, GRAMMAR_CATEGORIES } from './constants';
import { 
  Sparkles, Trophy, 
  Layers, RefreshCw, Flame, 
  Brain, TrendingUp, AlertTriangle, Play,
  ChevronRight, Loader2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'stats' | 'quiz'>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_USER_PROGRESS);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hispania_v5_pro');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Corrupted save data.");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hispania_v5_pro', JSON.stringify(progress));
  }, [progress]);

  const startQuiz = async (topicId: string, isMixed: boolean = false) => {
    setIsLoading(true);
    setQuestions([]);
    setSelectedTopicId(topicId);
    
    try {
      let topicsToFetch: string[] = [];
      let refTitle = "";

      if (isMixed) {
        topicsToFetch = GRAMMAR_TOPICS
          .filter(t => progress.practicedTopicIds.includes(t.id))
          .map(t => t.name);
        if (topicsToFetch.length === 0) topicsToFetch = ["General Spanish Review"];
        refTitle = "Mixed Cumulative Review";
      } else {
        const topic = GRAMMAR_TOPICS.find(t => t.id === topicId);
        topicsToFetch = [topic?.name || ""];
        refTitle = topic?.name || "";
      }

      const [qs, ref] = await Promise.all([
        generateSpanishQuestions(topicsToFetch, progress.level, 10),
        isMixed ? Promise.resolve(`## Mixed Review\nFocused on your recently practiced topics.`) : fetchGrammarReference(refTitle)
      ]);
      
      if (qs.length === 0) throw new Error("Failed to generate questions");

      setQuestions(qs);
      setReference(ref);
      setStartTime(Date.now());
      setView('quiz');
    } catch (error) {
      alert("¡Oye! The AI is taking a siesta. Please try again in a few seconds.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizFinish = (score: number, answers: boolean[]) => {
    const endTime = Date.now();
    const timeSpentMin = Math.max(1, Math.round((endTime - (startTime || endTime)) / 60000));
    const totalQs = questions.length;
    const accuracy = (score / totalQs) * 100;
    
    setProgress(prev => {
      const updatedMastery = { ...prev.topicMastery };
      const tid = selectedTopicId || 'mixed';
      const currentMastery = updatedMastery[tid] || 0;
      updatedMastery[tid] = Math.round(currentMastery * 0.4 + accuracy * 0.6);
      
      const updatedPracticed = prev.practicedTopicIds.includes(tid) 
        ? prev.practicedTopicIds : [...prev.practicedTopicIds, tid];

      return {
        ...prev,
        completedQuizzes: prev.completedQuizzes + 1,
        totalQuestions: prev.totalQuestions + totalQs,
        totalCorrect: prev.totalCorrect + score,
        totalMinutes: prev.totalMinutes + timeSpentMin,
        streak: prev.streak + 1,
        lastStudyDate: new Date().toISOString(),
        averageScore: Math.round(((prev.totalCorrect + score) / (prev.totalQuestions + totalQs)) * 100),
        topicMastery: updatedMastery,
        practicedTopicIds: updatedPracticed
      };
    });

    setView('stats');
  };

  const runAnalysis = async () => {
    if (isAnalyzing || Object.keys(progress.topicMastery).length === 0) return;
    setIsAnalyzing(true);
    try {
      const analysis = await generateWeaknessAnalysis(progress.topicMastery, GRAMMAR_TOPICS);
      setAiAnalysis(analysis);
    } catch (e) {
      setAiAnalysis("Unable to generate analysis at this time.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = useMemo(() => {
    return GRAMMAR_CATEGORIES.map(cat => {
      const catTopics = GRAMMAR_TOPICS.filter(t => t.category === cat);
      const scores = catTopics
        .map(t => progress.topicMastery[t.id])
        .filter(s => s !== undefined);
      
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { category: cat.split('(')[0].trim(), mastery: avg, full: 100 };
    });
  }, [progress.topicMastery]);

  const recommendedTopic = useMemo(() => {
    const practiced = GRAMMAR_TOPICS.filter(t => progress.practicedTopicIds.includes(t.id));
    if (practiced.length === 0) return GRAMMAR_TOPICS[0];
    const lowest = [...practiced].sort((a, b) => (progress.topicMastery[a.id] || 0) - (progress.topicMastery[b.id] || 0))[0];
    return lowest;
  }, [progress.practicedTopicIds, progress.topicMastery]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
          <Brain className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 italic">Preparando la lección...</h2>
        <p className="text-slate-500 font-medium max-w-sm">
          Gemini is crafting custom DELE B2 challenges and detailed grammar notes just for you.
        </p>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {progress.practicedTopicIds.length > 0 && (
        <div className="mb-10 p-6 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 text-white rounded-3xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">AI Recommendation</div>
              <h3 className="text-xl font-black text-slate-800">Review: {recommendedTopic?.name}</h3>
              <p className="text-sm text-slate-500 font-medium">Mastery: {progress.topicMastery[recommendedTopic?.id || ''] || 0}%</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button size="lg" onClick={() => startQuiz(recommendedTopic?.id || '')} className="rounded-2xl shadow-lg shadow-indigo-200">
              Quiz Me <Play className="ml-2 w-4 h-4 fill-current" />
            </Button>
          </div>
        </div>
      )}

      <div className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-12">
        <div className="flex-1">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter italic">Grammar Español</h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            Advanced DELE B2 Laboratory. Dynamic drills with integrated grammar guides to master the Spanish language.
          </p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button 
            onClick={() => setView('stats')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-8 py-5 rounded-[2rem] font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Trophy className="w-5 h-5 text-indigo-500" />
            Progreso
          </button>
          <button 
            onClick={() => startQuiz('mixed', true)} 
            disabled={progress.practicedTopicIds.length === 0}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-30"
          >
            <Layers className="w-5 h-5 text-amber-400" />
            Mixed Review
          </button>
        </div>
      </div>

      <div className="space-y-24">
        {GRAMMAR_CATEGORIES.map(category => (
          <section key={category}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-2 h-10 bg-indigo-600 rounded-full" />
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {GRAMMAR_TOPICS.filter(t => t.category === category).map(topic => {
                const mastery = progress.topicMastery[topic.id] || 0;
                const isPracticed = progress.practicedTopicIds.includes(topic.id);
                return (
                  <div key={topic.id} className={`bg-white rounded-[3rem] p-10 border transition-all hover:shadow-2xl hover:-translate-y-2 group relative flex flex-col justify-between ${isPracticed ? 'border-indigo-100' : 'border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">{topic.level}</span>
                        {mastery > 0 && (
                          <div className={`px-4 py-1.5 rounded-full text-xs font-black ${mastery > 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {mastery}% Mastered
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-4 leading-tight">{topic.name}</h3>
                      <p className="text-slate-400 mb-10 leading-relaxed font-medium line-clamp-3">{topic.description}</p>
                    </div>
                    <button 
                      onClick={() => startQuiz(topic.id)} 
                      className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all group-hover:scale-105"
                    >
                      Quiz Me <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800">Mastery Distribution</h3>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                <Radar name="Mastery" dataKey="mastery" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8">
           <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-xl flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-6 text-orange-400">
                    <Flame className="w-8 h-8" />
                    <span className="text-4xl font-black">{progress.streak}</span>
                    <span className="text-lg font-bold opacity-70">Day Streak</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end"><span className="opacity-50 font-bold uppercase tracking-widest text-xs">Total Qs</span><span className="text-2xl font-black">{progress.totalQuestions}</span></div>
                    <div className="flex justify-between items-end"><span className="opacity-50 font-bold uppercase tracking-widest text-xs">Time</span><span className="text-2xl font-black">{progress.totalMinutes}m</span></div>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                 <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-40">Accuracy</div>
                 <div className="flex items-end gap-3">
                    <span className="text-6xl font-black">{progress.averageScore}%</span>
                    <div className="mb-2 w-full h-2 bg-white/10 rounded-full">
                       <div className="h-full bg-green-400 rounded-full" style={{ width: `${progress.averageScore}%` }} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-12 shadow-xl border border-slate-100 relative">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
               <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3">AI Analysis <Sparkles className="w-7 h-7 text-indigo-600" /></h3>
               <p className="text-slate-400 font-medium">Linguistic insights based on your recent activity.</p>
            </div>
            <button 
              onClick={runAnalysis} 
              disabled={isAnalyzing || progress.practicedTopicIds.length === 0}
              className="px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              {aiAnalysis ? 'Update Report' : 'Generate Report'}
            </button>
          </div>

          {!aiAnalysis ? (
            <div className="py-20 flex flex-col items-center text-center opacity-40">
               <Brain className="w-16 h-16 mb-4" />
               <p className="font-medium italic">Click analyze to see your DELE B2 profile.</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
              <article>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
              </article>
              <div className="space-y-6">
                 <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                    <h4 className="text-orange-800 font-black mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Priorities</h4>
                    <div className="space-y-2">
                       {GRAMMAR_TOPICS
                         .filter(t => progress.practicedTopicIds.includes(t.id) && (progress.topicMastery[t.id] || 0) < 70)
                         .map(t => (
                           <div key={t.id} className="flex justify-between p-3 bg-white rounded-xl border border-orange-200">
                              <span className="font-bold text-slate-700">{t.name}</span>
                              <span className="text-orange-600 font-black">{progress.topicMastery[t.id]}%</span>
                           </div>
                         ))}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar onNavigate={setView} activeView={view} />
      <main>
        {view === 'dashboard' && renderDashboard()}
        {view === 'quiz' && <QuizSession questions={questions} referenceText={reference} onCancel={() => setView('dashboard')} onFinish={handleQuizFinish} />}
        {view === 'stats' && renderStats()}
      </main>
    </div>
  );
};

export default App;
