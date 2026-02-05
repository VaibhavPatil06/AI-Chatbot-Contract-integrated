'use client';

import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeFormatterProps {
  code: string;
  language: string;
}

export default function CodeFormatter({ code, language }: CodeFormatterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDownload = () => {
    const fileExtensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      sql: 'sql',
      bash: 'sh',
      shell: 'sh',
    };

    const extension = fileExtensions[language.toLowerCase()] || 'txt';
    const filename = `code.${extension}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  // Basic syntax highlighting (simplified for demonstration)
  const getLanguageColor = (lang: string): string => {
    const colorMap: { [key: string]: string } = {
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      python: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      java: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cpp: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      html: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      css: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    
    return colorMap[lang.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="my-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${getLanguageColor(language)}`}>
            {language.toUpperCase()}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {code.split('\n').length} lines
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="w-8 h-8 p-0"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="w-8 h-8 p-0"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
        
        {/* Line numbers */}
        <div className="absolute left-0 top-0 p-4 text-gray-500 text-sm font-mono leading-relaxed pointer-events-none select-none">
          {code.split('\n').map((_, index) => (
            <div key={index} className="text-right w-6">
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}