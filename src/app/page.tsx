import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ArrowRight, Feather, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold text-white">ClarityClinic</span>
          </Link>
          <Button asChild>
            <Link href="/dashboard">
              Go to App <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-28">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            Manage your clinic finances with clarity.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            ClarityClinic helps doctors track income and expenses, visualize trends, and keep a clean audit trail—without complex spreadsheets.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/transactions/add">Add First Transaction</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:border-primary/80 transition-colors duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Fast &amp; Intuitive</CardTitle>
                <p className="mt-2 text-muted-foreground">
                  A streamlined interface with AI-powered category suggestions makes recording transactions quicker than ever.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/80 transition-colors duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Privacy-First</CardTitle>
                <p className="mt-2 text-muted-foreground">
                  Your financial data is stored securely in your browser's local storage. No data ever leaves your device.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/80 transition-colors duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Feather className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Lightweight &amp; Open</CardTitle>
                <p className="mt-2 text-muted-foreground">
                  Built as a single-page application demo, easily extendable to connect to your preferred backend like Firebase or Supabase.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} ClarityClinic. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
