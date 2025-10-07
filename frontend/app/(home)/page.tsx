import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Users, FileText, Activity, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold">Client Files Viewer</span>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/login">Staff Login</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Secure • Fast • Reliable
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Internal Client File
            <span className="block text-indigo-600">Management Portal</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Secure file management system for internal staff. 
            Access your files, manage clients, and collaborate with your team.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/login">Staff Login</Link>
            </Button>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Contact your administrator for account access
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Secure File Management
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-indigo-500 transition-colors">
            <CardContent className="pt-6">
              <Lock className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Multi-factor authentication, session management, and account lockout protection.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-colors">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Granular permissions with Super Admin, Admin, Manager, and User roles.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-colors">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">File Management</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Upload, organize, and share files securely with your team and clients.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-colors">
            <CardContent className="pt-6">
              <Activity className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Activity Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Complete audit trail with login history, device tracking, and user activity logs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-colors">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Rate Limiting</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Built-in protection against brute force attacks and suspicious activity.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-colors">
            <CardContent className="pt-6">
              <CheckCircle className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Verification</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Automated email workflows for verification, password resets, and notifications.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Staff Portal Access</h2>
            <p className="text-xl mb-8 text-indigo-100">
              Secure login for authorized staff members only.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link href="/login">Access Portal</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 Client Files Viewer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
