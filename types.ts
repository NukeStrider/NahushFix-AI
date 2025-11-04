import React from 'react';

export type ToolCategory = 'Enhance' | 'Filters' | 'Cleanup';

export interface Tool {
  id: string;
  name: string;
  prompt: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  category: ToolCategory;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string; // The original, unmodified URL
  history: string[]; // URLs of edits, history[0] is the original previewUrl
  aspectRatio: number;
}
