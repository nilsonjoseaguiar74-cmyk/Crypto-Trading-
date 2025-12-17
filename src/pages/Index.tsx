import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, Hero } from '@/components/layout/Header';
import { AccessGate } from '@/components/web3/AccessGate';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useWallet } from '@/hooks/useWallet';

const Index = () => {
  const { isConnected, hasAccess, address, connect } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Header isConnected={false} />
            <Hero onConnect={connect} />
          </motion.div>
        ) : !hasAccess ? (
          <motion.div
            key="access-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Header isConnected={true} />
            <div className="pt-16">
              <AccessGate />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard address={address!} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
