import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function CtaBanner() {
  return (
    <section className="section">
      <div className="page-container">
        <div className="rounded-cta bg-primary p-12 text-center text-white shadow-cta lg:p-20">
          <h2 className="mb-8 text-4xl font-bold lg:text-5xl">Ready to rethink hiring?</h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="h-14 rounded-full bg-white px-8 text-lg font-bold text-primary shadow-soft hover:bg-white/90 hover:text-primary">
              <Link href="/book-demo">Book a Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-white/80 bg-transparent px-8 text-lg font-bold text-white shadow-none hover:bg-white/10 hover:text-white">
              <Link href="/company-signup">Get Early Access</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
