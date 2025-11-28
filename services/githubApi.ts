

import axios from 'axios';
import { Repo, Content, Commit, Issue, PullRequest, Contributor, RepoSearchResult, Branch, UserProfile, Release, WorkflowRun, Deployment, DeploymentStatus, CompareResult, Gist } from '../types';

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
    
  getPullRequestFiles: (owner: string, repo: string, pullNumber: number) =>
    API.get<{filename: string, status: string, additions: number, deletions: number}[]>(`/repos/${owner}/${repo}/pulls/${pullNumber}/files`),

  getBranches: (owner: string, repo: string) =>
    API.get<Branch[]>(`/repos/${owner}/${repo}/branches`),

  getUserProfile: (username: string) =>
    API.get<UserProfile>(`/users/${username}`),

  getUserRepos: (username: string, page = 1) =>
    API.get<Repo[]>(`/users/${username}/repos?sort=updated&page=${page}&per_page=12`),

  // --- New Endpoints ---

  getReleases: (owner: string, repo: string, page = 1) =>
    API.get<Release[]>(`/repos/${owner}/${repo}/releases?page=${page}&per_page=10`),

  getWorkflowRuns: (owner: string, repo: string, page = 1) =>
    API.get<{ total_count: number; workflow_runs: WorkflowRun[] }>(`/repos/${owner}/${repo}/actions/runs?page=${page}&per_page=15`),

  getDeployments: (owner: string, repo: string, page = 1) =>
    API.get<Deployment[]>(`/repos/${owner}/${repo}/deployments?page=${page}&per_page=10`),

  getDeploymentStatuses: (owner: string, repo: string, deploymentId: number) =>
    API.get<DeploymentStatus[]>(`/repos/${owner}/${repo}/deployments/${deploymentId}/statuses`),
    
  compareCommits: (owner: string, repo: string, base: string, head: string) =>
    API.get<CompareResult>(`/repos/${owner}/${repo}/compare/${base}...${head}`),

  // Fetch the last commit for a specific path to determine modification time
  getLastCommitForPath: (owner: string, repo: string, path: string, sha?: string) =>
    API.get<Commit[]>(`/repos/${owner}/${repo}/commits`, {
        params: { path, sha, per_page: 1 }
    }),

  // --- Gists ---
  getUserGists: (username: string, page = 1) =>
    API.get<Gist[]>(`/users/${username}/gists?page=${page}&per_page=12`),

  getGist: (id: string) =>
    API.get<Gist>(`/gists/${id}`),
};