/**
 * @file mathjax.ts
 * @author Angelo Nicolson
 * @brief MathJax initialization and configuration
 * @description Initializes and configures MathJax library for rendering mathematical notation in the browser. Sets up SVG output, TeX input support, and configures MathJax options for optimal mathematical expression rendering.
 */

declare global {
  interface Window {
    MathJax: any;
  }
}

export interface MathJaxConfig {
  tex: {
    inlineMath: string[][];
    displayMath: string[][];
    packages: string[];
  };
  svg: {
    fontCache: string;
  };
  startup: {
    typeset: boolean;
  };
}

export const defaultConfig: MathJaxConfig = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    packages: ['base', 'ams', 'newcommand', 'configMacros', 'action', 'require']
  },
  svg: {
    fontCache: 'global'
  },
  startup: {
    typeset: false
  }
};

let mathJaxLoaded = false;

export const loadMathJax = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (mathJaxLoaded && window.MathJax) {
      resolve();
      return;
    }

    window.MathJax = defaultConfig;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    script.onload = () => {
      mathJaxLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load MathJax'));
    
    document.head.appendChild(script);
  });
};

export const renderMath = async (element: HTMLElement): Promise<void> => {
  await loadMathJax();
  
  if (window.MathJax && window.MathJax.typesetPromise) {
    try {
      await window.MathJax.typesetPromise([element]);
    } catch (error) {
      console.error('MathJax rendering error:', error);
    }
  }
};
