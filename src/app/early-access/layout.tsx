
import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50/70 to-orange-50/70 py-12">
        <div className="mb-6">
            <Link href="/company-login">
                <Logo />
            </Link>
        </div>
        {children}
    </div>
  )
}
