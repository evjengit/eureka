import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizCard from '../components/Quiz/QuizCard';
import { Quiz, Category } from '../types';
import { quizService, categoryService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const difficulties = ['Nybegynner', 'Middels', 'Ekspert'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch quizzes and categories in parallel
        const [quizzesData, categoriesData] = await Promise.all([
          quizService.getAllQuizzes(),
          categoryService.getAllCategories()
        ]);

        setQuizzes(quizzesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Det oppstod en feil ved lasting av data. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCategory = !selectedCategory || quiz.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || quiz.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const handleQuizClick = (quizId: string) => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/quiz/${quizId}` } });
    } else {
      navigate(`/quiz/${quizId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Prøv igjen
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {currentUser 
            ? `Velkommen tilbake, ${userProfile?.username || 'Quiz-mester'}!`
            : 'Velkommen til Eureka Quiz'}
        </h1>
        <p className="text-xl text-gray-600">
          {currentUser
            ? 'Fortsett din quiz-reise og test dine kunnskaper!'
            : 'Logg inn for å teste dine kunnskaper og konkurrere med andre!'}
        </p>
        {!currentUser && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
          >
            Logg inn for å starte
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Alle kategorier</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px] max-w-xs">
          <select
            className="select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">Alle vanskelighetsgrader</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} onClick={() => quiz.id && handleQuizClick(quiz.id)}>
              <QuizCard quiz={quiz} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">
            Ingen quizer funnet med valgte filtre.
          </p>
        </div>
      )}

      {currentUser && userProfile?.quizzes_taken && userProfile.quizzes_taken.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Din Quiz-historie</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-lg mb-2">
              Du har fullført {userProfile.quizzes_taken.length} quizer
            </p>
            <p className="text-gray-600">
              Gjennomsnittlig score: {
                Math.round(
                  userProfile.quizzes_taken.reduce((acc, quiz) => acc + quiz.score, 0) / 
                  userProfile.quizzes_taken.length
                )
              }%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
