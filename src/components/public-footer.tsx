import Link from 'next/link';
import Logo from './logo';
import { BookDemoButton } from './book-demo-button';
export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-16 text-white">
      <div className="page-container grid gap-12 md:grid-cols-3">
        <div>
          <Logo tone="white" height={36} className="mb-4" />
          <p className="text-sm text-slate-400">AI-Powered Hiring OS</p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold">Product</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/#features" className="rounded-control transition-colors hover:text-white">Features</Link></li>
            <li><BookDemoButton className="rounded-control transition-colors hover:text-white">Book a Demo</BookDemoButton></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold">Company</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/about" className="rounded-control transition-colors hover:text-white">About</Link></li>
            <li><Link href="/contact" className="rounded-control transition-colors hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="page-container mt-16 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Kofeko. All rights reserved.
      </div>
    </footer>
  );
}
