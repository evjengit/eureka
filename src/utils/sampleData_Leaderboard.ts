import { setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const userId = 'ehdgMaxQJuMYThsYS1UpQSkyZ192';

const leaderboardData = [
  // Global leaderboards
  { id: 'global_Musikk', type: 'global', category: 'Musikk', score: 85 },
  { id: 'global_Kunst_og_Kultur', type: 'global', category: 'Kunst og Kultur', score: 90 },
  { id: 'global_Natur_og_Miljø', type: 'global', category: 'Natur og Miljø', score: 88 },
  { id: 'global_Sport', type: 'global', category: 'Sport', score: 92 },
  { id: 'global_Litteratur', type: 'global', category: 'Litteratur', score: 87 },
  { id: 'global_Vitenskap', type: 'global', category: 'Vitenskap', score: 91 },
  { id: 'global_Teknologi', type: 'global', category: 'Teknologi', score: 89 },
  { id: 'global_Geografi', type: 'global', category: 'Geografi', score: 86 },
  { id: 'global_Mat_og_Drikke', type: 'global', category: 'Mat og Drikke', score: 83 },
  { id: 'global_Underholdning', type: 'global', category: 'Underholdning', score: 90 },

  // Weekly leaderboards
  { id: 'weekly_Musikk', type: 'weekly', category: 'Musikk', score: 82 },
  { id: 'weekly_Kunst_og_Kultur', type: 'weekly', category: 'Kunst og Kultur', score: 88 },
  { id: 'weekly_Natur_og_Miljø', type: 'weekly', category: 'Natur og Miljø', score: 80 },
  { id: 'weekly_Sport', type: 'weekly', category: 'Sport', score: 85 },
  { id: 'weekly_Litteratur', type: 'weekly', category: 'Litteratur', score: 84 },
  { id: 'weekly_Vitenskap', type: 'weekly', category: 'Vitenskap', score: 86 },
  { id: 'weekly_Teknologi', type: 'weekly', category: 'Teknologi', score: 87 },
  { id: 'weekly_Geografi', type: 'weekly', category: 'Geografi', score: 81 },
  { id: 'weekly_Mat_og_Drikke', type: 'weekly', category: 'Mat og Drikke', score: 79 },
  { id: 'weekly_Underholdning', type: 'weekly', category: 'Underholdning', score: 85 },
];

export const pushLeaderboardData = async () => {
  try {
    for (const entry of leaderboardData) {
      const leaderboardDocRef = doc(db, 'leaderboard', entry.id);
      await setDoc(leaderboardDocRef, {
        id: entry.id,
        type: entry.type,
        category: entry.category,
        users: [
          {
            user_id: userId,
            score: entry.score,
            rank: 1
          }
        ]
      });
      console.log(`Leaderboard document ${entry.id} created successfully.`);
    }
    console.log("All leaderboard data pushed successfully.");
  } catch (error) {
    console.error("Error pushing leaderboard data:", error);
  }
};
