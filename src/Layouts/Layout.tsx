import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div  className="mx-auto px-6 py-8">
      <main className="layout-main">
        {children}
      </main>
    
    </div>
  );
};

export default Layout;

