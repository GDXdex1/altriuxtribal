'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Home, User, Award, History, Edit2, Save, Package, Crown, GraduationCap, Hammer, Ship } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import type { TransportItem } from '@/types/game';
import { JAX_TO_KG } from '@/types/game';
import { TRANSPORT_OPTIONS } from '@/lib/travel-calculator';

interface InventoryItem {
  id: string;
  name: string;
  type: 'resource' | 'technology' | 'territory';
  quantity: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  weightPerUnit: number; // Weight in kg per unit
}

interface Title {
  id: string;
  name: string;
  description: string;
  nftId: string;
  icon: string;
  acquired: Date;
  category: 'noble' | 'academic' | 'trade';
}

interface HistoryEvent {
  id: string;
  date: Date;
  type: 'territory' | 'technology' | 'trade' | 'battle' | 'title';
  description: string;
  icon: string;
}

const INVENTORY_CAPACITY_JAX = 2; // Maximum 2 Jax capacity
const INVENTORY_CAPACITY_KG = INVENTORY_CAPACITY_JAX * JAX_TO_KG; // 40kg total

export default function MyCharacterPage(): JSX.Element {
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [userDescription, setUserDescription] = useState<string>(
    'Ambitious explorer of the Altriux World. Building my empire one hex at a time. Master of trade and diplomacy.'
  );
  const [tempDescription, setTempDescription] = useState<string>(userDescription);

  // Mock transportation items - will be NFTs
  const mockTransportation: TransportItem[] = [
    { ...TRANSPORT_OPTIONS[1], nftId: 'NFT-HORSE-001' }, // Horse
    { ...TRANSPORT_OPTIONS[2], nftId: 'NFT-CART-001' }, // Cart
    { ...TRANSPORT_OPTIONS[4], nftId: 'NFT-SHIP-001' } // Basic Ship
  ];

  // Mock data - will be replaced with Sui blockchain data
  const mockInventory: InventoryItem[] = [
    { id: '1', name: 'Gold', type: 'resource', quantity: 1250, icon: '⚜️', rarity: 'legendary', weightPerUnit: 0.01 },
    { id: '2', name: 'Iron', type: 'resource', quantity: 3400, icon: '⚙️', rarity: 'common', weightPerUnit: 0.005 },
    { id: '3', name: 'Wood', type: 'resource', quantity: 5600, icon: '🪵', rarity: 'common', weightPerUnit: 0.003 },
    { id: '4', name: 'Wheat', type: 'resource', quantity: 2100, icon: '🌾', rarity: 'common', weightPerUnit: 0.001 },
    { id: '5', name: 'Spices', type: 'resource', quantity: 890, icon: '🌶️', rarity: 'rare', weightPerUnit: 0.0005 },
    { id: '6', name: 'Silver', type: 'resource', quantity: 670, icon: '⚪', rarity: 'rare', weightPerUnit: 0.008 },
    { id: '7', name: 'Blacksmith Tech', type: 'technology', quantity: 1, icon: '🔨', rarity: 'epic', weightPerUnit: 0 },
    { id: '8', name: 'Carpentry Tech', type: 'technology', quantity: 1, icon: '🪚', rarity: 'epic', weightPerUnit: 0 },
    { id: '9', name: 'Desert Territory', type: 'territory', quantity: 12, icon: '🏜️', rarity: 'rare', weightPerUnit: 0 },
    { id: '10', name: 'Plains Territory', type: 'territory', quantity: 24, icon: '🌾', rarity: 'common', weightPerUnit: 0 }
  ];

  const mockTitles: Title[] = [
    {
      id: 't1',
      name: 'Desert Wanderer',
      description: 'Claimed 10 desert territories',
      nftId: 'NFT-TITLE-0001',
      icon: '🏜️',
      acquired: new Date('2025-12-15'),
      category: 'noble'
    },
    {
      id: 't2',
      name: 'Master Blacksmith',
      description: 'Unlocked advanced metallurgy',
      nftId: 'NFT-TITLE-0042',
      icon: '🔨',
      acquired: new Date('2025-12-20'),
      category: 'trade'
    },
    {
      id: 't3',
      name: 'Resource Baron',
      description: 'Accumulated 10,000 resources',
      nftId: 'NFT-TITLE-0089',
      icon: '💰',
      acquired: new Date('2026-01-05'),
      category: 'noble'
    },
    {
      id: 't4',
      name: 'Scholar of Mathematics',
      description: 'Completed all mathematics research',
      nftId: 'NFT-TITLE-0110',
      icon: '📐',
      acquired: new Date('2026-01-08'),
      category: 'academic'
    },
    {
      id: 't5',
      name: 'Legendary Carpenter',
      description: 'Mastered the art of carpentry',
      nftId: 'NFT-TITLE-0125',
      icon: '🪚',
      acquired: new Date('2025-12-28'),
      category: 'trade'
    }
  ];

  const mockHistory: HistoryEvent[] = [
    {
      id: 'h1',
      date: new Date('2026-01-10'),
      type: 'territory',
      description: 'Claimed 3 plains territories near America continent',
      icon: '🌾'
    },
    {
      id: 'h2',
      date: new Date('2026-01-08'),
      type: 'technology',
      description: 'Researched Carpentry technology',
      icon: '🪚'
    },
    {
      id: 'h3',
      date: new Date('2026-01-05'),
      type: 'title',
      description: 'Earned title: Resource Baron',
      icon: '🏆'
    },
    {
      id: 'h4',
      date: new Date('2026-01-02'),
      type: 'trade',
      description: 'Traded 500 wood for 200 iron',
      icon: '🤝'
    },
    {
      id: 'h5',
      date: new Date('2025-12-28'),
      type: 'territory',
      description: 'Claimed volcanic island with gold deposits',
      icon: '🌋'
    },
    {
      id: 'h6',
      date: new Date('2025-12-20'),
      type: 'title',
      description: 'Earned title: Master Blacksmith',
      icon: '🔨'
    }
  ];

  // Calculate total inventory weight
  const totalWeightKg = useMemo(() => {
    return mockInventory.reduce((total: number, item: InventoryItem) => {
      return total + (item.quantity * item.weightPerUnit);
    }, 0);
  }, [mockInventory]);

  const totalWeightJax = totalWeightKg / JAX_TO_KG;
  const weightPercentage = (totalWeightKg / INVENTORY_CAPACITY_KG) * 100;

  // Categorize titles
  const titlesByCategory = useMemo(() => {
    return {
      noble: mockTitles.filter((t: Title) => t.category === 'noble'),
      academic: mockTitles.filter((t: Title) => t.category === 'academic'),
      trade: mockTitles.filter((t: Title) => t.category === 'trade')
    };
  }, [mockTitles]);

  const rarityColors: Record<string, string> = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500'
  };

  const handleSaveDescription = (): void => {
    setUserDescription(tempDescription);
    setIsEditingDescription(false);
  };

  const handleCancelEdit = (): void => {
    setTempDescription(userDescription);
    setIsEditingDescription(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">My Character</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* User Profile Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Anonymous Player</h2>
              <p className="text-purple-200 text-sm mb-2">Wallet: 0x742d...8f3c</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  Level 12
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  24 Territories
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {mockTitles.length} Titles
                </Badge>
              </div>

              {/* User Description */}
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">About Me</h3>
                  {!isEditingDescription ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDescription(true)}
                      className="gap-2 text-purple-300 hover:text-purple-100"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="text-red-300 hover:text-red-100"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveDescription}
                        className="gap-2 text-green-300 hover:text-green-100"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                {isEditingDescription ? (
                  <Textarea
                    value={tempDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTempDescription(e.target.value)}
                    className="bg-black/30 text-white border-white/20 min-h-[100px]"
                    placeholder="Describe your journey in Altriux World..."
                  />
                ) : (
                  <p className="text-purple-200">{userDescription}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-purple-600">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="transportation" className="data-[state=active]:bg-purple-600">
              <Ship className="w-4 h-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="titles" className="data-[state=active]:bg-purple-600">
              <Award className="w-4 h-4 mr-2" />
              Titles
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="mt-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              {/* Weight/Capacity Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Inventory</h3>
                  <div className="text-right">
                    <p className="text-sm text-purple-200">
                      Weight: <span className="font-bold text-white">{totalWeightJax.toFixed(2)} Jax</span> / {INVENTORY_CAPACITY_JAX} Jax
                    </p>
                    <p className="text-xs text-purple-300">
                      ({totalWeightKg.toFixed(1)}kg / {INVENTORY_CAPACITY_KG}kg)
                    </p>
                  </div>
                </div>
                <Progress 
                  value={weightPercentage} 
                  className="h-3 bg-black/30"
                />
                <p className="text-xs text-purple-300 mt-1 text-center">
                  1 Jax = 20kg • Capacity: 2 Jax (40kg)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockInventory.map((item: InventoryItem) => {
                  const itemTotalWeight = item.quantity * item.weightPerUnit;
                  const itemWeightJax = itemTotalWeight / JAX_TO_KG;
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-black/20 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{item.icon}</span>
                        <Badge className={`${rarityColors[item.rarity]} text-white border-0`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <h4 className="text-white font-semibold mb-1">{item.name}</h4>
                      <p className="text-purple-200 text-sm capitalize">{item.type}</p>
                      <p className="text-yellow-300 font-bold mt-2">×{item.quantity.toLocaleString()}</p>
                      {item.weightPerUnit > 0 && (
                        <p className="text-purple-400 text-xs mt-1">
                          Weight: {itemWeightJax.toFixed(3)} Jax
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Transportation Tab */}
          <TabsContent value="transportation" className="mt-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Transportation NFTs</h3>
              <p className="text-purple-200 text-sm mb-6">
                Your transportation methods for traveling across duchies
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTransportation.map((transport: TransportItem) => (
                  <div
                    key={transport.id}
                    className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-5 border border-blue-500/30 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{transport.icon}</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                        {transport.type}
                      </Badge>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{transport.name}</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-200">
                        <span className="text-blue-400">Speed:</span> {transport.speed} tiles/day
                      </p>
                      <p className="text-blue-200">
                        <span className="text-blue-400">Capacity:</span> {transport.weightCapacity} Jax ({transport.weightCapacity * JAX_TO_KG}kg)
                      </p>
                      {transport.nftId && (
                        <p className="text-blue-300 text-xs mt-2">
                          NFT ID: {transport.nftId}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* On Foot Option */}
              <div className="mt-6 p-4 bg-gray-600/20 rounded-lg border border-gray-500/30">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚶</span>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">On Foot</h4>
                    <p className="text-gray-300 text-sm">
                      Default method • 0.5 tiles/day • 0.5 Jax capacity
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Titles Tab */}
          <TabsContent value="titles" className="mt-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Titles (NFTs)</h3>
              
              {/* Noble Titles */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-yellow-300">Noble Titles</h4>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    {titlesByCategory.noble.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {titlesByCategory.noble.map((title: Title) => (
                    <div
                      key={title.id}
                      className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 rounded-lg p-5 border border-yellow-500/30 hover:border-yellow-400 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{title.icon}</span>
                        <div className="flex-1">
                          <h5 className="text-white font-bold text-lg mb-1">{title.name}</h5>
                          <p className="text-yellow-200 text-sm mb-2">{title.description}</p>
                          <p className="text-yellow-300 text-xs mb-1">NFT ID: {title.nftId}</p>
                          <p className="text-yellow-400 text-xs">
                            Acquired: {title.acquired.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Titles */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-semibold text-blue-300">Academic Titles</h4>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {titlesByCategory.academic.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {titlesByCategory.academic.map((title: Title) => (
                    <div
                      key={title.id}
                      className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-5 border border-blue-500/30 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{title.icon}</span>
                        <div className="flex-1">
                          <h5 className="text-white font-bold text-lg mb-1">{title.name}</h5>
                          <p className="text-blue-200 text-sm mb-2">{title.description}</p>
                          <p className="text-blue-300 text-xs mb-1">NFT ID: {title.nftId}</p>
                          <p className="text-blue-400 text-xs">
                            Acquired: {title.acquired.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade Titles */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Hammer className="w-5 h-5 text-orange-400" />
                  <h4 className="text-lg font-semibold text-orange-300">Trade Titles</h4>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {titlesByCategory.trade.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {titlesByCategory.trade.map((title: Title) => (
                    <div
                      key={title.id}
                      className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg p-5 border border-orange-500/30 hover:border-orange-400 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{title.icon}</span>
                        <div className="flex-1">
                          <h5 className="text-white font-bold text-lg mb-1">{title.name}</h5>
                          <p className="text-orange-200 text-sm mb-2">{title.description}</p>
                          <p className="text-orange-300 text-xs mb-1">NFT ID: {title.nftId}</p>
                          <p className="text-orange-400 text-xs">
                            Acquired: {title.acquired.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Player History</h3>
              <div className="space-y-3">
                {mockHistory.map((event: HistoryEvent) => (
                  <div
                    key={event.id}
                    className="bg-black/20 rounded-lg p-4 border border-white/10 hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{event.icon}</span>
                      <div className="flex-1">
                        <p className="text-white mb-1">{event.description}</p>
                        <p className="text-purple-400 text-xs">
                          {event.date.toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/30 capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Note */}
      <div className="max-w-6xl mx-auto mt-6 text-center">
        <p className="text-purple-300 text-sm">
          🔐 All data is stored on Sui blockchain • Titles are minted as NFTs
        </p>
      </div>
    </main>
  );
}
