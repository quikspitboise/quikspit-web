
import React from 'react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-6 border-t border-border/40 bg-background">
      <div className="container mx-auto flex items-center justify-center px-4 md:px-6">
        <div className="text-center text-sm text-muted-foreground">
          &copy; {year} Quikspit Auto Detailing. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
