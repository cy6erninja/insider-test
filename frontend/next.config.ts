import type { NextConfig } from "next";

// Get repository name from package.json or environment variable for GitHub Pages
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'insider-test';

// Check if we're in a GitHub Pages environment
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: "export",
  
  // Set basePath and assetPrefix for GitHub Pages
  ...(isGitHubPages ? {
    basePath: `/${REPO_NAME}`,
    assetPrefix: `/${REPO_NAME}/`,
  } : {}),
  
  // Add image optimization settings
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
