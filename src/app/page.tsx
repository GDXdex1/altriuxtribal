'use client'
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";
import Link from "next/link";
import { Globe, ShoppingCart, Wallet, MessageSquare, Castle, FlaskConical } from "lucide-react";

export default function Page(): JSX.Element {
  const { addMiniApp } = useAddMiniApp();
  const isInFarcaster = useIsInFarcaster()
  useQuickAuth(isInFarcaster)
  
  useEffect(() => {
    const tryAddMiniApp = async () => {
      try {
        await addMiniApp()
      } catch (error) {
        console.error('Failed to add mini app:', error)
      }
    }
    tryAddMiniApp()
  }, [addMiniApp])
  
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (document.readyState !== 'complete') {
          await new Promise<void>(resolve => {
            if (document.readyState === 'complete') {
              resolve()
            } else {
              window.addEventListener('load', () => resolve(), { once: true })
            }
          })
        }
        
        await sdk.actions.ready()
        console.log('Farcaster SDK initialized successfully - app fully loaded')
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error)
        
        setTimeout(async () => {
          try {
            await sdk.actions.ready()
            console.log('Farcaster SDK initialized on retry')
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError)
          }
        }, 1000)
      }
    }
    
    initializeFarcaster()
  }, [])
  
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 md:pt-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white mb-2">
          Drariux Network
        </h1>
        <p className="text-center text-purple-200 text-sm md:text-base">
          Explore the decentralized world on Sui blockchain
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Altriux World */}
          <Link href="/altriux-world">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <Globe className="w-10 h-10 text-white" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                  Live
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Altriux World</h2>
                <p className="text-blue-100 text-sm">
                  Explore the vast hexagonal earth map
                </p>
              </div>
            </div>
          </Link>

          {/* Science */}
          <Link href="/science">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-500 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <FlaskConical className="w-10 h-10 text-white" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                  Live
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Science</h2>
                <p className="text-indigo-100 text-sm">
                  Research technologies and trades
                </p>
              </div>
            </div>
          </Link>

          {/* Marketplace */}
          <Link href="/marketplace">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <ShoppingCart className="w-10 h-10 text-white" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                  Soon
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Marketplace</h2>
                <p className="text-emerald-100 text-sm">
                  Trade resources and territories
                </p>
              </div>
            </div>
          </Link>

          {/* Wallet */}
          <Link href="/wallet">
            <div className="bg-gradient-to-br from-amber-600 to-orange-500 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <Wallet className="w-10 h-10 text-white" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                  Soon
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Wallet</h2>
                <p className="text-amber-100 text-sm">
                  Manage your Sui assets
                </p>
              </div>
            </div>
          </Link>

          {/* Forum */}
          <Link href="/forum">
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <MessageSquare className="w-10 h-10 text-white" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                  Soon
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Forum</h2>
                <p className="text-purple-100 text-sm">
                  Join the community discussion
                </p>
              </div>
            </div>
          </Link>

          {/* My Character - Full Width */}
          <Link href="/my-character" className="md:col-span-2">
            <div className="bg-gradient-to-br from-red-600 to-rose-500 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-200 active:scale-95 min-h-[140px] flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <Castle className="w-10 h-10 text-white" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                  Live
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">My Character</h2>
                <p className="text-red-100 text-sm">
                  View your profile, inventory, and titles
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-purple-300 text-xs px-4">
        <p>Powered by Sui Network</p>
      </div>
    </main>
  );
}
