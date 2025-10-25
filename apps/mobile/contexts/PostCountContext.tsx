import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PostCountContextType {
  postCount: number;
  setPostCount: (count: number) => void;
  incrementPostCount: () => void;
  decrementPostCount: () => void;
  resetPostCount: () => void;
}

const PostCountContext = createContext<PostCountContextType | undefined>(undefined);

interface PostCountProviderProps {
  children: ReactNode;
}

export function PostCountProvider({ children }: PostCountProviderProps) {
  const [postCount, setPostCount] = useState<number>(0);

  const incrementPostCount = () => {
    setPostCount(prev => prev + 1);
  };

  const decrementPostCount = () => {
    setPostCount(prev => Math.max(0, prev - 1));
  };

  const resetPostCount = () => {
    setPostCount(0);
  };

  const value: PostCountContextType = {
    postCount,
    setPostCount,
    incrementPostCount,
    decrementPostCount,
    resetPostCount,
  };

  return (
    <PostCountContext.Provider value={value}>
      {children}
    </PostCountContext.Provider>
  );
}

export function usePostCount() {
  const context = useContext(PostCountContext);
  if (context === undefined) {
    throw new Error('usePostCount must be used within a PostCountProvider');
  }
  return context;
}
