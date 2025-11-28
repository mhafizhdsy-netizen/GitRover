
import { Repo, UserProfile } from '../types';

const BASE_URL = 'https://git-rover.vercel.app/';

export const createWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: BASE_URL,
  name: 'GitRover',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}#/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const createRepoSchema = (repo: Repo) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: repo.name,
  codeRepository: repo.html_url,
  description: repo.description,
  programmingLanguage: repo.language,
  author: {
    '@type': 'Person',
    name: repo.owner.login,
    url: `${BASE_URL}#/profile/${repo.owner.login}`,
  },
});

export const createProfileSchema = (user: UserProfile) => {
  const common = {
    '@context': 'https://schema.org',
    name: user.name || user.login,
    url: `${BASE_URL}#/profile/${user.login}`,
    image: user.avatar_url,
    mainEntityOfPage: user.html_url,
  };

  if (user.type === 'Organization') {
    return {
      ...common,
      '@type': 'Organization',
      description: user.bio,
    };
  }
  
  return {
    ...common,
    '@type': 'Person',
    description: user.bio,
    givenName: user.name,
    additionalName: user.login,
    jobTitle: "Developer", // Generic, but better than nothing
    worksFor: user.company,
    homeLocation: user.location,
  };
};
