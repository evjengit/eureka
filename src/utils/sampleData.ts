
import { quizService, categoryService, userService, leaderboardService } from '../services/firebaseService';
export const createSampleData = async () => {
  try {
    // Create sample categories
    const categories = [
      {
        name: 'Geografi',
        description: 'Spørsmål om land, byer og geografi',
        image_url: 'https://example.com/geography-icon.png'
      },
      {
        name: 'Historie',
        description: 'Spørsmål om historiske hendelser og personer',
        image_url: 'https://example.com/history-icon.png'
      },
      {
        name: 'Vitenskap',
        description: 'Spørsmål om vitenskapelige oppdagelser og konsepter',
        image_url: 'https://example.com/science-icon.png'
      },
      {
        name: 'Sport',
        description: 'Spørsmål om ulike sportsgrener og sportsbegivenheter',
        image_url: 'https://example.com/sports-icon.png'
      },
      {
        name: 'Kunst og Kultur',
        description: 'Spørsmål om kunst, musikk, litteratur og kultur generelt',
        image_url: 'https://example.com/art-culture-icon.png'
      },
      {
        name: 'Underholdning',
        description: 'Spørsmål om filmer, TV-serier, musikk og popkultur',
        image_url: 'https://example.com/entertainment-icon.png'
      },
      {
        name: 'Teknologi',
        description: 'Spørsmål om teknologiske fremskritt, gadgets og IT',
        image_url: 'https://example.com/technology-icon.png'
      },
      {
        name: 'Mat og Drikke',
        description: 'Spørsmål om matretter, drikke og kulinariske tradisjoner',
        image_url: 'https://example.com/food-drink-icon.png'
      },
      {
        name: 'Natur og Miljø',
        description: 'Spørsmål om naturfenomener, dyreliv og miljøvern',
        image_url: 'https://example.com/nature-environment-icon.png'
      },
      {
        name: 'Litteratur',
        description: 'Spørsmål om bøker, forfattere og litterære verker',
        image_url: 'https://example.com/literature-icon.png'
      }
    ];

    const categoryPromises = categories.map(category => 
      categoryService.createCategory(category)
    );

    const categoryIds = await Promise.all(categoryPromises);
    console.log('Categories created:', categoryIds);

    // Create sample users
    const users = [
      {
        username: 'TestBruker1',
        email: 'test1@example.com',
        badges: ['Nybegynner'],
        quizzes_taken: [],
        profile_picture: 'https://example.com/avatar1.png'
      },
      {
        username: 'TestBruker2',
        email: 'test2@example.com',
        badges: ['Quiz Master'],
        quizzes_taken: [],
        profile_picture: 'https://example.com/avatar2.png'
      }
    ];

    const userPromises = users.map(user => 
      userService.createUser(user)
    );

    const userIds = await Promise.all(userPromises);
    console.log('Users created:', userIds);

    // Create sample quizzes
    const quizzes = [
      {
        title: 'Norsk Geografi Quiz',
        category: 'Geografi',
        difficulty: 'Nybegynner' as const,
        description: 'Test din kunnskap om norsk geografi',
        questions: [
          {
            question: 'Hva er hovedstaden i Norge?',
            options: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
            correct_answer: 'Oslo'
          },
          {
            question: 'Hvilket fylke ligger Bergen i?',
            options: ['Vestland', 'Rogaland', 'Møre og Romsdal', 'Viken'],
            correct_answer: 'Vestland'
          },
          {
            question: 'Hva er Norges høyeste fjell?',
            options: ['Galdhøpiggen', 'Glittertind', 'Snøhetta', 'Store Skagastølstind'],
            correct_answer: 'Galdhøpiggen'
          }
        ],
        created_by: 'system'
      },
      {
        title: 'Norsk Historie',
        category: 'Historie',
        difficulty: 'Middels' as const,
        description: 'Test din kunnskap om norsk historie',
        questions: [
          {
            question: 'Når ble Norge selvstendig fra Sverige?',
            options: ['1905', '1814', '1945', '1884'],
            correct_answer: '1905'
          },
          {
            question: 'Hvem var Norges første konge etter uavhengigheten i 1905?',
            options: ['Haakon VII', 'Olav V', 'Harald V', 'Oscar II'],
            correct_answer: 'Haakon VII'
          },
          {
            question: 'Når fikk kvinner stemmerett i Norge?',
            options: ['1913', '1905', '1920', '1898'],
            correct_answer: '1913'
          }
        ],
        created_by: 'system'
      },
      {
        title: 'Underholdning Quiz',
        category: 'Underholdning',
        difficulty: 'Nybegynner' as const,
        description: 'Test din kunnskap om filmer, TV-serier, musikk og popkultur',
        questions: [
          {
            question: 'Hvem spilte rollen som Jack i "Titanic"?',
            options: ['Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Johnny Depp'],
            correct_answer: 'Leonardo DiCaprio'
          },
          {
            question: 'Hva heter Harry Potters bestevenn?',
            options: ['Ronny Wiltersen', 'Draco Malfang', 'Neville Longbottom', 'Hermine Grang'],
            correct_answer: 'Ronny Wiltersen'
          },
          {
            question: 'Hvilken serie handler om familien Stark?',
            options: ['Game of Thrones', 'Breaking Bad', 'Friends', 'The Crown'],
            correct_answer: 'Game of Thrones'
          }
        ],
        created_by: 'system'
      },
      {
        title: 'Teknologi Quiz',
        category: 'Teknologi',
        difficulty: 'Middels' as const,
        description: 'Test din kunnskap om teknologiske fremskritt, gadgets og IT',
        questions: [
          {
            question: 'Hvem regnes som grunnleggeren av Microsoft?',
            options: ['Bill Gates', 'Steve Jobs', 'Elon Musk', 'Mark Zuckerberg'],
            correct_answer: 'Bill Gates'
          },
          {
            question: 'Hva står "AI" for?',
            options: ['Artificial Intelligence', 'Automated Input', 'Augmented Interface', 'Analytical Index'],
            correct_answer: 'Artificial Intelligence'
          },
          {
            question: 'Hva heter det mest kjente operativsystemet fra Apple?',
            options: ['macOS', 'Windows', 'Linux', 'Ubuntu'],
            correct_answer: 'macOS'
          }
        ],
        created_by: 'system'
      },
      {
        title: 'Mat og Drikke Quiz',
        category: 'Mat og Drikke',
        difficulty: 'Nybegynner' as const,
        description: 'Test din kunnskap om matretter, drikke og kulinariske tradisjoner',
        questions: [
          {
            question: 'Hva er hovedingrediensen i sushi?',
            options: ['Ris', 'Brød', 'Pasta', 'Poteter'],
            correct_answer: 'Ris'
          },
          {
            question: 'Hvilken drink inneholder rom, mynte, lime og sukker?',
            options: ['Mojito', 'Margarita', 'Pina Colada', 'Bloody Mary'],
            correct_answer: 'Mojito'
          },
          {
            question: 'Hva heter den italienske retten laget av deig, saus og ost?',
            options: ['Pizza', 'Pasta', 'Lasagne', 'Risotto'],
            correct_answer: 'Pizza'
          }
        ],
        created_by: 'system'
      },
      {
        title: 'Natur og Miljø Quiz',
        category: 'Natur og Miljø',
        difficulty: 'Middels' as const,
        description: 'Test din kunnskap om naturfenomener, dyreliv og miljøvern',
        questions: [
          {
            question: 'Hvilket dyr er kjent som "skogens konge" i Norge?',
            options: ['Elg', 'Ulv', 'Bjørn', 'Rein'],
            correct_answer: 'Elg'
          },
          {
            question: 'Hva er fotosyntese?',
            options: ['Prosessen der planter lager mat fra sollys', 'En type rovdyrangrep', 'En stormtype', 'Et steinmineral'],
            correct_answer: 'Prosessen der planter lager mat fra sollys'
          },
          {
            question: 'Hvilken gass er den viktigste drivhusgassen?',
            options: ['Karbon dioksid', 'Oksygen', 'Nitrogen', 'Metan'],
            correct_answer: 'Karbon dioksid'
          }
        ],
        created_by: 'system'
      },
      {
        title: 'Litteratur Quiz',
        category: 'Litteratur',
        difficulty: 'Middels' as const,
        description: 'Test din kunnskap om bøker, forfattere og litterære verker',
        questions: [
          {
            question: 'Hvem skrev "Pride and Prejudice"?',
            options: ['Jane Austen', 'Charles Dickens', 'Mark Twain', 'Mary Shelley'],
            correct_answer: 'Jane Austen'
          },
          {
            question: 'Hva heter trollmannen i "Ringenes Herre"?',
            options: ['Gandalf', 'Dumbledore', 'Merlin', 'Saruman'],
            correct_answer: 'Gandalf'
          },
          {
            question: 'Hvem er forfatteren bak "Harry Potter"-serien?',
            options: ['J.K. Rowling', 'J.R.R. Tolkien', 'George R.R. Martin', 'C.S. Lewis'],
            correct_answer: 'J.K. Rowling'
          }
        ],
        created_by: 'system'
      }
    ];

    const quizPromises = quizzes.map(quiz => quizService.createQuiz(quiz));
    const quizIds = await Promise.all(quizPromises);
    console.log('Quizzes created:', quizIds);

    // Create initial leaderboard data
    const leaderboardTypes = ['global', 'weekly', 'daily'];
    const leaderboardPromises = leaderboardTypes.map(async (type) => {
      // Create global leaderboard
      await leaderboardService.updateLeaderboard(
        type,
        userIds[0],
        85  // Sample score for first user
      );

      // Add second user to leaderboard
      await leaderboardService.updateLeaderboard(
        type,
        userIds[1],
        92  // Sample score for second user
      );

      // Create category-specific leaderboards
      for (const categoryId of categoryIds) {
        await leaderboardService.updateLeaderboard(
          type,
          userIds[0],
          78,  // Sample score for first user
          categoryId
        );

        await leaderboardService.updateLeaderboard(
          type,
          userIds[1],
          88,  // Sample score for second user
          categoryId
        );
      }
    });

    await Promise.all(leaderboardPromises);
    console.log('Leaderboard data created');

    return {
      categoryIds,
      userIds,
      quizIds
    };
  } catch (error) {
    console.error('Error creating sample data:', error);
  };
}