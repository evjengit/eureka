import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Quiz, Question } from '../types';
import { quizService, leaderboardService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

interface ResultsState {
  score: number;
  totalQuestions: number;
  duration: number;
  answers: string[];
  resultId: string;
}

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser, userProfile } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const state = location.state as ResultsState;

  useEffect(() => {
    const loadQuizData = async () => {
      if (!id || !currentUser) {
        navigate('/');
        return;
      }

      try {
        const quizData = await quizService.getQuizById(id);
        if (quizData) {
          setQuiz(quizData);
          
          // Update leaderboard with the result
          if (state?.score) {
            const scorePercentage = Math.round((state.score / state.totalQuestions) * 100);
            await Promise.all([
              leaderboardService.updateLeaderboard('global', currentUser.uid, scorePercentage),
              leaderboardService.updateLeaderboard('weekly', currentUser.uid, scorePercentage)
            ]);
          }
        } else {
          setError('Quiz ikke funnet');
        }
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError('Kunne ikke laste quiz-resultater');
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [id, currentUser, navigate, state]);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !quiz || !state) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error || 'Kunne ikke laste resultater'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tilbake til forsiden
        </button>
      </div>
    );
  }

  const percentage = Math.round((state.score / state.totalQuestions) * 100);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Fantastisk! Du er en quiz-mester! 🏆';
    if (percentage >= 70) return 'Veldig bra jobbet! 🌟';
    if (percentage >= 50) return 'Bra innsats! 👍';
    return 'Fortsett å øve! Du blir bedre for hver quiz! 💪';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleShare = async () => {
    const shareText = `Jeg fikk ${percentage}% på "${quiz.title}" i Eureka Quiz! Kan du slå meg? 🎯`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Min Quiz Score',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText)
        .then(() => alert('Resultat kopiert til utklippstavlen!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <p className="text-gray-600">Quiz fullført!</p>
        </div>

        <div className="text-center mb-8">
          <div className={`text-5xl font-bold mb-4 ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
          <p className="text-xl font-semibold mb-2">
            {getScoreMessage(percentage)}
          </p>
          <p className="text-gray-600 mb-2">
            Du fikk {state.score} av {state.totalQuestions} riktige svar
          </p>
          <p className="text-gray-600">
            Tid brukt: {formatTime(state.duration)}
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleShare}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
            </svg>
            Del resultat
          </button>
          <button
            onClick={() => navigate(`/quiz/${id}`)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Prøv igjen
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Dine svar:</h2>
          {quiz.questions.map((question: Question, index: number) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-2">
                Spørsmål {index + 1}: {question.question}
              </p>
              <div className="ml-4">
                <p className="text-gray-600">
                  Ditt svar: {' '}
                  <span className={
                    question.correct_answer === state.answers[index]
                      ? 'text-green-600 font-medium'
                      : 'text-red-600 font-medium'
                  }>
                    {state.answers[index]}
                  </span>
                </p>
                {question.correct_answer !== state.answers[index] && (
                  <p className="text-green-600 mt-1">
                    Riktig svar: {question.correct_answer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Tilbake til forsiden
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
