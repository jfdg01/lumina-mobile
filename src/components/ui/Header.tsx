import React from 'react';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, rightElement, className = "" }) => {
  return (
    <Box className={`p-6 pt-12 border-b border-outline-100 bg-background-0 ${className}`}>
      <HStack className="justify-between items-center">
        <Heading size="3xl" className="text-left text-typography-900 font-black tracking-tighter uppercase">
          {title}
        </Heading>
        {rightElement}
      </HStack>
    </Box>
  );
};
