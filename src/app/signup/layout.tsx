
import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50/70 to-orange-50/70 backdrop-blur-sm">
        <div className="mb-6 text-center">
            <Link href="/login" className="flex justify-center">
                <Logo />
            </Link>
             <p className="text-sm text-muted-foreground mt-2">
                Recruiter? <Link href="/early-access" className="underline text-primary font-semibold">Register for early access</Link>.
            </p>
        </div>
        {children}
    </div>
  )
}
