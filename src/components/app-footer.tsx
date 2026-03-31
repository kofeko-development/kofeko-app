
import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="bg-[#34495E] text-white">
      <div className="container py-4 text-sm flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Kofeko. All rights reserved.</span>
           <nav className="flex items-center gap-4">
             <Link href="/open-positions" className="hover:text-primary-light transition-colors">
               Careers
             </Link>
           </nav>
      </div>
    </footer>
  );
}
