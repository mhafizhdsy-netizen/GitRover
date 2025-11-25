
import React from 'react';
import { File, Folder, FileText, FileCode, FileJson, FileImage, FileArchive, GitBranch, Shield } from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  html: FileCode,
  css: FileCode,
  scss: FileCode,
  json: FileJson,
  md: FileText,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  zip: FileArchive,
  rar: FileArchive,
  'package.json': FileJson,
  'package-lock.json': FileJson,
  '.gitignore': GitBranch,
  license: Shield,
};

export const getFileIcon = (name: string, type: 'file' | 'dir') => {
  if (type === 'dir') {
    return <Folder size={18} className="text-blue-500" />;
  }

  const lowerName = name.toLowerCase();
  
  if(lowerName.includes('license')) return <Shield size={18} className="text-gray-500" />
  
  const ext = lowerName.split('.').pop() || '';
  const IconComponent = iconMap[ext] || iconMap[lowerName] || File;
  
  return <IconComponent size={18} className="text-gray-500 dark:text-gray-400" />;
};
