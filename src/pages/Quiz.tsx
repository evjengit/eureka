import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz as QuizType, Question } from '../types';
import { quizService, resultService, userService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

const Quiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!id) return;
      try {
        const quizData = await quizService.getQuizById(id);
        if (quizData) {
          setQuiz(quizData);
          setSelectedAnswers(new Array(quizData.questions.length).fill(''));
        } else {
          setError('Quiz ikke funnet');
        }
      } catch (err) {
        setError('Kunne ikke laste quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!currentUser) {
      navigate('/login', { state: { from: `/quiz/${id}` } });
      return;
    }

    loadQuiz();
  }, [id, currentUser, navigate]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!selectedAnswers[currentQuestionIndex]) {
      if (!window.confirm('Du har ikke valgt et svar. Vil du fortsette til neste spørsmål?')) {
        return;
      }
    }
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 1000);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = (questions: Question[], answers: string[]): number => {
    return questions.reduce((score, question, index) => {
      return question.correct_answer === answers[index] ? score + 1 : score;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!quiz || !id || !currentUser) return;

    const unansweredQuestions = selectedAnswers.some(answer => !answer);
    if (unansweredQuestions) {
      if (!window.confirm('Du har ikke svart på alle spørsmålene. Vil du fortsette?')) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const score = calculateScore(quiz.questions, selectedAnswers);
      const correctAnswers = score;
      const scorePercentage = Math.round((score / quiz.questions.length) * 100);

      // Save result
      const resultId = await resultService.saveResult({
        user_id: currentUser.uid,
        quiz_id: id,
        score: scorePercentage,
        correct_answers: correctAnswers,
        completion_time: endTime,
        duration
      });

      // Update user's quiz history
      await userService.updateUserQuizzes(currentUser.uid, {
        quiz_id: id,
        score: scorePercentage
      });

      navigate(`/results/${id}`, {
        state: {
          score: correctAnswers,
          totalQuestions: quiz.questions.length,
          duration,
          answers: selectedAnswers,
          resultId
        }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Kunne ikke lagre resultatet');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Quiz ikke funnet'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tilbake til forsiden
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Spørsmål {currentQuestionIndex + 1} av {quiz.questions.length}</span>
            <span>{quiz.difficulty}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-800 mb-4">{currentQuestion.question}</h2>
          {currentQuestion.image_url && (
            <img
              src={currentQuestion.image_url}
              alt="Question"
              className="mb-4 max-w-full rounded-lg"
            />
          )}
          <div className="flex flex-col gap-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-100 border-blue-500 border-2 shadow-md transform scale-[1.02]'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      )}
                    </div>
                    {option}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showConfirmation && selectedAnswers[currentQuestionIndex] && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
            Svar registrert: {selectedAnswers[currentQuestionIndex]}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-2 rounded-lg transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Forrige
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sender inn...' : 'Fullfør Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Neste
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
