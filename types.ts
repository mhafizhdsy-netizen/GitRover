
export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  language: string;
  license: {
    name: string;
  } | null;
  topics: string[];
  default_branch?: string;
  homepage?: string;
  clone_url?: string;
  html_url: string;
}

export interface RepoSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: Repo[];
}

export interface Content {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  state: 'open' | 'closed';
  labels: {
    name: string;
    color: string;
  }[];
}

export interface PullRequest extends Issue {}

export interface Branch {
  name:string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface UserProfile {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}