import { create } from 'zustand';
import { gamificationService } from '@/lib/api/gamification';

interface GamificationState {
  badges: Array<{ name?: string }>;
  streak: { current_streak?: number } | null;
  currentChallenge: { title?: string; goal_count?: number } | null;
  leaderboard: Array<{ rank: number; user_name?: string; username?: string; score: number }>;
  leaderboardType: 'streak' | 'check_ins' | 'community_support' | 'therapy_sessions' | 'progress_makers';
  leaderboardPeriod: 'weekly' | 'monthly' | 'all_time';
  isLoading: boolean;
  fetchGamificationData: () => Promise<void>;
  fetchLeaderboards: (type?: GamificationState['leaderboardType'], period?: GamificationState['leaderboardPeriod']) => Promise<void>;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  badges: [],
  streak: null,
  currentChallenge: null,
  leaderboard: [],
  leaderboardType: 'streak',
  leaderboardPeriod: 'weekly',
  isLoading: false,
  fetchGamificationData: async () => {
    set({ isLoading: true });
    try {
      // getProfile() now returns the unwrapped payload directly
      const data = await gamificationService.getProfile();
      set({
        badges: data?.badges || [],
        streak: data?.streak || null,
        currentChallenge: data?.challenges?.[0] || null,
      });
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchLeaderboards: async (type = 'streak', period = 'weekly') => {
    set({ isLoading: true });
    try {
      const data = await gamificationService.getLeaderboards();
      const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      set({ leaderboard: rows, leaderboardType: type, leaderboardPeriod: period });
    } catch (error) {
      console.error('Failed to fetch leaderboards:', error);
      set({ leaderboard: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
