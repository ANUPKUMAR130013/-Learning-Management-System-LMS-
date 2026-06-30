import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Quiz, QuizQuestion, QuizOption, QuizAttempt } from '../types/database';
import {
  Award,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';

export function QuizPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<(QuizQuestion & { options: QuizOption[] })[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (lessonId && user) {
      fetchQuiz();
    }
  }, [lessonId, user]);

  async function fetchQuiz() {
    setLoading(true);

    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (!quizData) {
      setLoading(false);
      return;
    }

    setQuiz(quizData);

    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizData.id)
      .order('order_index');

    if (questionsData) {
      const questionsWithOptions = await Promise.all(
        questionsData.map(async (q) => {
          const { data: options } = await supabase
            .from('quiz_options')
            .select('*')
            .eq('question_id', q.id)
            .order('order_index');
          return { ...q, options: options || [] };
        })
      );
      setQuestions(questionsWithOptions);
    }

    const { data: attemptsData } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizData.id)
      .eq('student_id', user!.id)
      .order('submitted_at', { ascending: false });

    if (attemptsData) {
      setAttempts(attemptsData);
    }

    setLoading(false);
  }

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;

    setSubmitting(true);

    let correctAnswers = 0;
    let totalPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;
      const selectedOption = question.options.find((o) => o.id === answers[question.id]);
      if (selectedOption?.is_correct) {
        correctAnswers += question.points;
      }
    });

    const score = totalPoints > 0 ? (correctAnswers / totalPoints) * 100 : 0;
    const passed = score >= quiz.passing_score;
    const attemptNumber = attempts.length + 1;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        student_id: user!.id,
        score,
        passed,
        attempt_number: attemptNumber,
        answers,
      })
      .select()
      .single();

    if (!error && data) {
      setResult(data);
    }

    setSubmitting(false);
  };

  const handleRetry = () => {
    if (!quiz || attempts.length >= quiz.max_attempts) return;
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">Quiz not available</h2>
          <Link
            to={`/courses/${courseId}/lessons/${lessonId}`}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Back to lesson
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    const passed = result.passed;

    return (
      <div className="min-h-screen bg-slate-950 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div
              className={`p-8 text-center ${
                passed
                  ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10'
                  : 'bg-gradient-to-br from-rose-500/10 to-orange-500/10'
              }`}
            >
              <div
                className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  passed ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                }`}
              >
                {passed ? (
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                ) : (
                  <XCircle className="w-10 h-10 text-rose-400" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h1>
              <p className="text-slate-400">
                {passed
                  ? 'You passed the quiz successfully.'
                  : 'You did not reach the passing score. Review the material and try again.'}
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">
                    {Math.round(result.score || 0)}%
                  </p>
                  <p className="text-sm text-slate-400">Your Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">{quiz.passing_score}%</p>
                  <p className="text-sm text-slate-400">Passing Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">
                    {attemptNumber}/{quiz.max_attempts}
                  </p>
                  <p className="text-sm text-slate-400">Attempts</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <h3 className="font-medium text-white">Review Your Answers</h3>
                {questions.map((question, index) => {
                  const selectedId = result.answers[question.id];
                  const selectedOption = question.options.find((o) => o.id === selectedId);
                  const correctOption = question.options.find((o) => o.is_correct);
                  const isCorrect = selectedOption?.is_correct;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-xl border ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white mb-2">
                            <span className="text-slate-500 mr-2">{index + 1}.</span>
                            {question.question_text}
                          </p>
                          <p className="text-sm text-slate-400">
                            Your answer: {selectedOption?.option_text || 'Not answered'}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-emerald-400 mt-1">
                              Correct answer: {correctOption?.option_text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Link
                  to={`/courses/${courseId}/lessons/${lessonId}`}
                  className="flex-1 py-3 bg-slate-800 text-white font-medium rounded-xl text-center hover:bg-slate-700 transition-colors"
                >
                  Back to Lesson
                </Link>
                {!passed && attemptNumber < quiz.max_attempts && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl text-center hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const canProceed = !!answers[question?.id];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canSubmit =
    Object.keys(answers).length === questions.length &&
    attempts.length < quiz.max_attempts;

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to={`/courses/${courseId}/lessons/${lessonId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to lesson
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="font-semibold text-white">{quiz.title}</h1>
                  <p className="text-sm text-slate-400">
                    {attempts.length}/{quiz.max_attempts} attempts used
                  </p>
                </div>
              </div>
              <span className="text-sm text-slate-500">
                Passing score: {quiz.passing_score}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="p-6">
            {question && (
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-2">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
                <h2 className="text-lg font-medium text-white">{question.question_text}</h2>
              </div>
            )}

            <div className="space-y-3">
              {question?.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(question.id, option.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    answers[question.id] === option.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-700 hover:border-slate-600 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-slate-500 mr-3">
                    {String.fromCharCode(65 + question.options.indexOf(option))}.
                  </span>
                  {option.option_text}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
              <button
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Submit Quiz
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  disabled={!canProceed}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 font-medium rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
