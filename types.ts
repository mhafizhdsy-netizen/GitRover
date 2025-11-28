

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
  html_url: string;
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
  body: string | null;
}

export interface PullRequest extends Issue {
  merged_at?: string | null;
}

export interface Organization {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
}

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
  updated_at: string;
  hireable: boolean | null;
  type: string;
}

// --- New Types for Releases, Builds, and Deployments ---

export interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  content_type: string;
  updated_at: string;
}

export interface Release {
  id: number;
  tag_name: string;
  target_commitish: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  author: {
    login: string;
    avatar_url: string;
  };
  assets: ReleaseAsset[];
  html_url: string;
  tarball_url?: string;
  zipball_url?: string;
}

export interface WorkflowRun {
  id: number;
  name: string;
  display_title?: string; // GitHub API provides this, falling back to name if missing
  head_branch: string;
  head_sha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  run_number: number;
  event: string;
  actor: {
    login: string;
    avatar_url: string;
  };
}

export interface Deployment {
  id: number;
  sha: string;
  ref: string;
  task: string;
  payload: any;
  original_environment: string;
  environment: string;
  description: string | null;
  creator: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  statuses_url: string;
  repository_url: string;
}

export interface DeploymentStatus {
  id: number;
  state: 'error' | 'failure' | 'inactive' | 'pending' | 'success' | 'queued' | 'in_progress';
  description: string;
  target_url: string;
  created_at: string;
  updated_at: string;
}

// --- Types for Comparison ---

export interface CompareFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  patch?: string;
}

export interface CompareResult {
  url: string;
  html_url: string;
  permalink_url: string;
  diff_url: string;
  patch_url: string;
  base_commit: Commit;
  merge_base_commit: Commit;
  status: string; // "ahead", "behind", "identical"
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: Commit[];
  files: CompareFile[];
}

// --- Gist Types ---

export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content?: string; // Content is populated when fetching single gist
}

export interface Gist {
  id: string;
  html_url: string;
  files: { [key: string]: GistFile };
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}
