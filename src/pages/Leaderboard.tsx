import React, { useEffect, useState } from 'react';
import { Leaderboard as LeaderboardType, Category, User } from '../types';
import { leaderboardService, categoryService, userService } from '../services/firebaseService';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'global' | 'weekly'>('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Kunne ikke laste kategorier');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const leaderboardData = await leaderboardService.getLeaderboard(
          selectedType,
          selectedCategory || undefined
        );

        // Initialize empty leaderboard if none exists
        if (!leaderboardData) {
          setLeaderboard({
            type: selectedType,
            category: selectedCategory || undefined,
            users: []
          });
          return;
        }

        setLeaderboard(leaderboardData);

        // Only fetch user details if there are users in the leaderboard
        if (leaderboardData.users && leaderboardData.users.length > 0) {
          const userIds = leaderboardData.users.map(user => user.user_id);
          const uniqueUserIds = [...new Set(userIds)];
          
          const userDetailsPromises = uniqueUserIds.map(userId =>
            userService.getUserById(userId)
          );
          
          const users = await Promise.all(userDetailsPromises);
          const userDetailsMap: Record<string, User> = {};
          
          users.forEach(user => {
            if (user) {
              userDetailsMap[user.id!] = user;
            }
          });
          
          setUserDetails(userDetailsMap);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Kunne ikke laste topplisten');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedCategory, selectedType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Toppliste</h1>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <select
            className="select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'global' | 'weekly')}
          >
            <option value="global">Alle tider</option>
            <option value="weekly">Denne uken</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] max-w-xs">
          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Alle kategorier</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : leaderboard && leaderboard.users && leaderboard.users.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rangering
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bruker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poeng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.users.map((entry) => {
                const user = userDetails[entry.user_id];
                return (
                  <tr key={entry.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`
                          flex items-center justify-center w-8 h-8 rounded-full
                          ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                            entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                            entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                            'text-gray-500'}
                        `}>
                          {entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user?.profile_picture && (
                          <img
                            className="h-8 w-8 rounded-full mr-3"
                            src={user.profile_picture}
                            alt=""
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {user?.username || 'Ukjent bruker'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.score} poeng
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">
            Ingen resultater funnet for valgte filtre.
          </p>
          <p className="text-gray-500 mt-2">
            Ta noen quizer for å komme på topplisten!
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
