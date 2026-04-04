import client from './client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  earned_at?: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goal_count: number;
  type: string;
  start_date: string;
  end_date: string;
}

export const gamificationService = {
  async getProfile() {
    const response = await client.get('/api/v1/gamification', {
      // this endpoint may not exist for all roles; avoid spamming user with errors
      suppressErrorToast: true,
    });
    return response.data.data ?? response.data;
  },
  async getBadges() {
    const response = await client.get('/api/v1/user/badges');
    return response.data.data ?? response.data;
  },
  async getStreak() {
    const response = await client.get('/api/v1/user/streak');
    return response.data.data ?? response.data;
  },
  async getCurrentChallenge() {
    const response = await client.get('/api/v1/challenge/current');
    return response.data.data ?? response.data;
  },
  async getLeaderboards() {
    const response = await client.get('/api/v1/leaderboards');
    return response.data.data ?? response.data;
  }
};