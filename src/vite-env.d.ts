import '@testing-library/jest-dom';

declare module '*.css' {
  const content: string;
  export default content;
}
