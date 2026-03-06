import type { Charity } from '@/types';

const FEATURED: Charity[] = [
  {
    id: 'st-jude',
    name: "St. Jude Children's Research Hospital",
    category: 'Healthcare',
    ein: '62-0646012',
    donateUrl: 'https://www.stjude.org/donate',
    isVerified: true,
  },
  {
    id: 'red-cross',
    name: 'American Red Cross',
    category: 'Disaster Relief',
    ein: '53-0196605',
    donateUrl: 'https://www.redcross.org/donate',
    isVerified: true,
  },
  {
    id: 'feed-america',
    name: 'Feeding America',
    category: 'Food & Hunger',
    ein: '36-3673599',
    donateUrl: 'https://www.feedingamerica.org/donate',
    isVerified: true,
  },
  {
    id: 'world-vision',
    name: 'World Vision',
    category: 'International Aid',
    ein: '95-1922279',
    donateUrl: 'https://www.worldvision.org/donate',
    isVerified: true,
  },
  {
    id: 'salvation-army',
    name: 'The Salvation Army',
    category: 'Community Services',
    ein: '58-0660607',
    donateUrl: 'https://www.salvationarmyusa.org/usn/donate',
    isVerified: true,
  },
];

export const charityService = {
  getFeatured(): Charity[] {
    return FEATURED;
  },

  async search(query: string): Promise<Charity[]> {
    const q = query.toLowerCase();
    return FEATURED.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  },
};
