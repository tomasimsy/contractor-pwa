"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy-light" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            One Square Roof
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Estimate & Invoice Management for Roofing Contractors
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-gold text-navy font-semibold px-8 py-3 rounded-lg hover:bg-gold-dark transition"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-gold text-navy font-semibold px-8 py-3 rounded-lg hover:bg-gold-dark transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-transparent border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-navy mb-12">
            Everything you need to manage your business
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-semibold text-lg mb-2">Create Estimates</h3>
              <p className="text-gray-600">Professional estimates with line items and projects</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">✍️</div>
              <h3 className="font-semibold text-lg mb-2">Digital Signatures</h3>
              <p className="text-gray-600">Customers can sign anywhere, anytime</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold text-lg mb-2">Track Payments</h3>
              <p className="text-gray-600">Manage deposits and final payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-navy-dark text-gray-400 py-8 text-center text-sm">
        <p>&copy; 2024 One Square Roof. All rights reserved.</p>
      </div>
    </div>
  );
}