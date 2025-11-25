
import axios from 'axios';
import { Repo, Content, Commit, Issue, PullRequest, Contributor, RepoSearchResult, Branch, UserProfile } from '../types';

const API = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('github_pat');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const githubApi = {
  searchRepositories: (query: string, sort?: string, order = 'desc', page = 1) => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('per_page', '12');
    
    // GitHub API defaults to 'best match' if sort is not provided.
    // We filter out 'best-match' string which is used for UI state.
    if (sort && sort !== 'best-match') {
        params.append('sort', sort);
        params.append('order', order);
    }
    
    return API.get<RepoSearchResult>(`/search/repositories?${params.toString()}`);
  },
  
  getRepository: (owner: string, repo: string) =>
    API.get<Repo>(`/repos/${owner}/${repo}`),
  
  getContents: (owner: string, repo: string, path = '', ref?: string) =>
    API.get<Content[] | Content>(`/repos/${owner}/${repo}/contents/${path}`, { params: ref ? { ref } : {} }),

  getTree: (owner: string, repo: string, sha: string, recursive = false) =>
    API.get<{tree: {path: string, mode: string, type: string, size?: number, sha: string}[], truncated: boolean}>(`/repos/${owner}/${repo}/git/trees/${sha}${recursive ? '?recursive=1' : ''}`),

  getReadme: (owner: string, repo: string, ref?: string) =>
    API.get<Content>(`/repos/${owner}/${repo}/readme`, { params: ref ? { ref } : {} }),
  
  getCommits: (owner: string, repo: string, page = 1) =>
    API.get<Commit[]>(`/repos/${owner}/${repo}/commits?page=${page}&per_page=20`),
    
  getLanguages: (owner: string, repo: string) =>
    API.get<Record<string, number>>(`/repos/${owner}/${repo}/languages`),
    
  getLicense: (owner: string, repo: string) =>
    API.get<any>(`/repos/${owner}/${repo}/license`), // License has a specific shape

  getContributors: (owner: string, repo: string) =>
    API.get<Contributor[]>(`/repos/${owner}/${repo}/contributors`),
    
  getIssues: (owner: string, repo: string, page = 1) =>
    API.get<Issue[]>(`/repos/${owner}/${repo}/issues?page=${page}&per_page=20`),
    
  getPullRequests: (owner: string, repo: string, page = 1) =>
    API.get<PullRequest[]>(`/repos/${owner}/${repo}/pulls?page=${page}&per_page=20`),
    
  getBranches: (owner: string, repo: string) =>
    API.get<Branch[]>(`/repos/${owner}/${repo}/branches`),

  getUserProfile: (username: string) =>
    API.get<UserProfile>(`/users/${username}`),

  getUserRepos: (username: string, page = 1) =>
    API.get<Repo[]>(`/users/${username}/repos?sort=updated&page=${page}&per_page=12`),
};
