
import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50/70 to-orange-50/70 backdrop-blur-sm">
        <div className="absolute top-6 right-6 text-sm">
            Are you a candidate?{' '}
            <Link href="/candidate-auth?mode=login" className="underline font-medium hover:text-primary transition-colors">
                Login here
            </Link>
        </div>
        <div className="mb-6">
            <Link href="/login">
                <Logo />
            </Link>
        </div>
        {children}
    </div>
  )
}
