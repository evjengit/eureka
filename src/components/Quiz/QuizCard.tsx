import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '../../types';

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const navigate = useNavigate();

  const handleQuizClick = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Nybegynner':
        return 'badge badge-beginner';
      case 'Middels':
        return 'badge badge-intermediate';
      case 'Ekspert':
        return 'badge badge-expert';
      default:
        return 'badge';
    }
  };

  const formatDate = (date: Date) => {
    try {
      return new Date(date).toLocaleDateString('no-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Ukjent dato';
    }
  };

  return (
    <div 
      className="quiz-card"
      onClick={handleQuizClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleQuizClick();
        }
      }}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-3 ">
          <h3 className="text-xl font-semibold text-gray-900">
            {quiz.title}
          </h3>
          <span className={getDifficultyColor(quiz.difficulty)}>
            {quiz.difficulty}
          </span>
        </div>
        
        <div className="mb-4">
          <span className="badge bg-blue-100 text-blue-800">
            {quiz.category}
          </span>
        </div>

        <p className="text-gray-600 mb-4">
          {quiz.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{quiz.questions?.length || 0} spørsmål</span>
          <span>
            Opprettet: {formatDate(quiz.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
