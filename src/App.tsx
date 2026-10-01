import React, { useState, useEffect } from 'react';
import { CustomerData, ShopStats, RepairContract, CustomerReview, RefurbishedPhoneItem, GamePlayMode } from './types/game';
import { createRandomizedCustomerPool, generateNextCustomer } from './data/problems';
import { ShopCounter } from './components/ShopCounter';
import { Workbench } from './components/Workbench';
import { ShopUpgradesModal } from './components/ShopUpgradesModal';
import { ShopStartScreen } from './components/ShopStartScreen';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<'SHOP_COUNTER' | 'WORKBENCH'>('SHOP_COUNTER');
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [gamePlayMode, setGamePlayMode] = useState<GamePlayMode>('solo_with_help');
  const [enableSuspicious, setEnableSuspicious] = useState<boolean>(true); // Abilitato di default per divertimento immediato

  // Clear any legacy cached pools in sessionStorage to guarantee pure randomness on every game start
  useEffect(() => {
    try {
      sessionStorage.removeItem('techlab_customer_pool_v2');
      sessionStorage.removeItem('techlab_customer_pool');
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    soundManager.isNightMode = (gamePlayMode === 'night');
  }, [gamePlayMode]);

  // Customer queue - Purely randomized customer pool created on start!
  const [customerPool, setCustomerPool] = useState<CustomerData[]>(() => createRandomizedCustomerPool(14, enableSuspicious));
  const [customerIndex, setCustomerIndex] = useState(0);

  // Shop economy & stats
  const [shopStats, setShopStats] = useState<ShopStats>({
    money: 140,
    reputation: 4.8,
    customersServed: 0,
    currentDay: 1,
    purchasedUpgrades: [],
    reviews: [
      {
        id: 'rev-0',
        customerName: 'Mario Vettore',
        rating: 5,
        comment: 'Riparazione schermo rapidissima, ottimo laboratorio sul balcone!',
        priceCharged: 75,
        isSuccess: true,
        isLate: false,
        date: 'Ieri',
      },
    ],
  });

  const [activeContract, setActiveContract] = useState<RepairContract>({
    agreedPrice: 75,
    agreedTimeSeconds: 960,
    timeRemainingSeconds: 960,
    isTimerActive: true,
    extraExpenses: 0,
    isShortCircuited: false,
    customerMood: 'neutral',
    expectationLevel: 'normal',
  });

  const [isUpgradesModalOpen, setIsUpgradesModalOpen] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);

  const currentCustomer = customerPool[customerIndex] || customerPool[0];
  const nextCustomers = customerPool.slice(customerIndex + 1);

  // Accept repair offer and transition to workbench (with expectation level)
  const handleAcceptContract = (price: number, timeSeconds: number, expectationLevel: 'normal' | 'high' | 'ultra' = 'normal') => {
    setActiveContract({
      agreedPrice: price,
      agreedTimeSeconds: timeSeconds,
      timeRemainingSeconds: timeSeconds,
      isTimerActive: true,
      extraExpenses: 0,
      isShortCircuited: false,
      customerMood: price <= currentCustomer.reward ? 'enthusiastic' : price > currentCustomer.reward * 1.3 ? 'hesitant' : 'neutral',
      expectationLevel,
    });
    setCurrentView('WORKBENCH');
  };

  // 1) Customer refused player's offer due to high price probability roll
  const handleCustomerRefusedOffer = (offeredPrice: number) => {
    soundManager.playBuzzerTriple();

    const refusedReview: CustomerReview = {
      id: `rev-refused-${Date.now()}`,
      customerName: currentCustomer.name,
      rating: 1,
      comment: `Preventivo di €${offeredPrice} spropositato per ${currentCustomer.phoneModelName}! Prezzi fuori mercato, me ne sono andato indignato!`,
      priceCharged: 0,
      isSuccess: false,
      isLate: true,
      date: 'Oggi',
    };

    setShopStats(prev => ({
      ...prev,
      reputation: Math.max(1.0, Number((prev.reputation - 0.15).toFixed(1))),
      reviews: [refusedReview, ...prev.reviews],
    }));

    advanceCustomer();
  };

  // 2) Discard / Refuse customer without making offer
  const handleDiscardCustomer = () => {
    soundManager.playBuzzer();

    const badReview: CustomerReview = {
      id: `rev-bad-${Date.now()}`,
      customerName: currentCustomer.name,
      rating: 1,
      comment: 'Il tecnico mi ha congedato senza nemmeno fare un preventivo! Servizio pessimo!',
      priceCharged: 0,
      isSuccess: false,
      isLate: true,
      date: 'Oggi',
    };

    setShopStats(prev => ({
      ...prev,
      reputation: Math.max(1.0, Number((prev.reputation - 0.2).toFixed(1))),
      reviews: [badReview, ...prev.reviews],
    }));

    advanceCustomer();
  };

  // Sell refurbished phone directly from counter
  const handleSellRefurbishedPhone = (item: RefurbishedPhoneItem) => {
    const saleReview: CustomerReview = {
      id: `rev-sale-${Date.now()}`,
      customerName: 'Cliente Vetrina',
      rating: 5,
      comment: `Ho acquistato il ${item.model}: prodotto eccellente e risparmio garantito!`,
      priceCharged: item.retailPrice,
      isSuccess: true,
      isLate: false,
      date: 'Oggi',
    };

    setShopStats(prev => ({
      ...prev,
      money: prev.money + item.netProfit,
      reputation: Math.min(5.0, Number((prev.reputation + 0.1).toFixed(1))),
      reviews: [saleReview, ...prev.reviews],
    }));
  };

  // Return to counter
  const handleReturnToCounter = () => {
    setCurrentView('SHOP_COUNTER');
  };

  // Generate on-demand fresh random customer
  const handleGenerateRandomCustomer = () => {
    soundManager.playCustomerChirp(1.2);
    const freshCustomer = generateNextCustomer(customerIndex + 1, enableSuspicious);
    setCustomerPool(prev => {
      const next = [...prev];
      next[customerIndex] = freshCustomer;
      return next;
    });
  };

  // Advance queue
  const advanceCustomer = () => {
    if (customerIndex + 3 >= customerPool.length) {
      const generated = generateNextCustomer(customerPool.length, enableSuspicious);
      setCustomerPool(prev => {
        const next = [...prev, generated];
        return next;
      });
    }
    setCustomerIndex(prev => prev + 1);
  };

  // Finalize repair from Workbench outcome modal
  const handleFinishRepairWithOutcome = (outcome: {
    isSuccess: boolean;
    netReward: number;
    rating: number;
    reviewComment: string;
    extraExpenses: number;
    isLate: boolean;
  }) => {
    soundManager.playCash();

    // Bonus reputation from shop decor
    let repDelta = 0;
    if (outcome.rating === 5) repDelta = 0.15;
    else if (outcome.rating === 4) repDelta = 0.05;
    else if (outcome.rating === 3) repDelta = -0.05;
    else if (outcome.rating === 2) repDelta = -0.15;
    else repDelta = -0.25;

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      customerName: currentCustomer.name,
      rating: outcome.rating,
      comment: outcome.reviewComment,
      priceCharged: outcome.netReward,
      isSuccess: outcome.isSuccess,
      isLate: outcome.isLate,
      date: 'Oggi',
    };

    setShopStats(prev => ({
      ...prev,
      money: prev.money + outcome.netReward,
      reputation: Math.max(1.0, Math.min(5.0, Number((prev.reputation + repDelta).toFixed(1)))),
      customersServed: prev.customersServed + 1,
      currentDay: Math.floor((prev.customersServed + 1) / 4) + 1,
      reviews: [newReview, ...prev.reviews],
    }));

    advanceCustomer();
    setCurrentView('SHOP_COUNTER');
  };

  // Buy upgrade
  const handleBuyUpgrade = (cost: number, upgradeId: string) => {
    setShopStats(prev => ({
      ...prev,
      money: prev.money - cost,
      purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId],
      reputation: Math.min(5.0, Number((prev.reputation + 0.1).toFixed(1))),
    }));
  };

  // Show "Apri il Negozio" start screen prior to opening shop
  if (!isShopOpen) {
    return (
      <ShopStartScreen
        stats={shopStats}
        currentMode={gamePlayMode}
        onSelectMode={setGamePlayMode}
        enableSuspicious={enableSuspicious}
        onToggleSuspicious={setEnableSuspicious}
        onOpenShop={() => {
          setCustomerPool(createRandomizedCustomerPool(14, enableSuspicious));
          setCustomerIndex(0);
          setIsShopOpen(true);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full min-h-[100dvh] bg-slate-100 text-slate-800 flex flex-col justify-between selection:bg-cyan-500 selection:text-white font-sans">
      <main className="flex-1 flex flex-col w-full h-full">
        {currentView === 'SHOP_COUNTER' ? (
          <ShopCounter
            currentCustomer={currentCustomer}
            nextCustomers={nextCustomers}
            stats={shopStats}
            gamePlayMode={gamePlayMode}
            onChangeGamePlayMode={setGamePlayMode}
            onAcceptContract={handleAcceptContract}
            onCustomerRefusedOffer={handleCustomerRefusedOffer}
            onDiscardCustomer={handleDiscardCustomer}
            onGenerateRandomCustomer={handleGenerateRandomCustomer}
            onSellRefurbishedPhone={handleSellRefurbishedPhone}
            onOpenShopModal={() => setIsUpgradesModalOpen(true)}
            isDeliveringRepairedPhone={isDelivering}
            onDeliveredNextCustomer={() => {
              setIsDelivering(false);
              advanceCustomer();
            }}
          />
        ) : (
          <Workbench
            customer={currentCustomer}
            stats={shopStats}
            contract={activeContract}
            gamePlayMode={gamePlayMode}
            onChangeGamePlayMode={setGamePlayMode}
            onFinishRepairWithOutcome={handleFinishRepairWithOutcome}
            onReturnToCounter={handleReturnToCounter}
          />
        )}
      </main>

      {/* Upgrades Store Modal */}
      <ShopUpgradesModal
        isOpen={isUpgradesModalOpen}
        onClose={() => setIsUpgradesModalOpen(false)}
        stats={shopStats}
        onBuyUpgrade={handleBuyUpgrade}
        purchasedUpgrades={shopStats.purchasedUpgrades}
      />
    </div>
  );
}

