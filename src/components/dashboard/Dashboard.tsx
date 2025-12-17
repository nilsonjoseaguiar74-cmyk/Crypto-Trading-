import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Sparkles, 
  TrendingUp,
  Activity,
  Clock,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { SignalCard } from '@/components/trading/SignalCard';
import { MarketOverview } from '@/components/trading/MarketOverview';
import { useWallet } from '@/hooks/useWallet';
import { useSignals } from '@/hooks/useSignals';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  address: string;
}

export function Dashboard({ address }: DashboardProps) {
  const { hasAccess, accessExpiry } = useWallet();
  const { 
    signals, 
    marketData, 
    isLoading, 
    lastUpdate,
    fetchSignals,
    generateNewSignal 
  } = useSignals(hasAccess);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (hasAccess && address) {
      fetchSignals(address);
    }
  }, [hasAccess, address, fetchSignals]);

  const handleGenerateSignal = async () => {
    setIsGenerating(true);
    try {
      const newSignal = await generateNewSignal(address);
      if (newSignal) {
      toast({
          title: 'New Signal Generated',
          description: `${newSignal.action} ${newSignal.token} with ${newSignal.confidence}% confidence`,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const formatAccessExpiry = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US');
  };

  const formatLastUpdate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}min ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isConnected={true} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Signals Dashboard
              </h1>
              <p className="text-muted-foreground">
                Exclusive AI-generated analyses for your wallet.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateSignal}
                disabled={isGenerating || isLoading}
                className="gap-2 bg-gradient-primary hover:opacity-90 shadow-glow"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate New Signal
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Signals</p>
                <p className="text-2xl font-bold">{signals.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">73%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Analysis</p>
                <p className="text-lg font-semibold">{formatLastUpdate(lastUpdate)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Access Until</p>
                <p className="text-lg font-semibold">{formatAccessExpiry(accessExpiry)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Market Overview
            </h2>
            <Badge variant="outline" className="font-mono text-xs">
              Updates every 1min
            </Badge>
          </div>
          <MarketOverview data={marketData} isLoading={isLoading} />
        </motion.section>

        {/* Signals Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Trading Signals
            </h2>
            <Badge variant="secondary" className="font-mono">
              {signals.length} signals
            </Badge>
          </div>

          <AnimatePresence mode="popLayout">
            {signals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signals.map((signal, index) => (
                  <SignalCard key={signal.id} signal={signal} index={index} />
                ))}
              </div>
            ) : (
              <Card className="glass">
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No signals available</h3>
                  <p className="text-muted-foreground mb-4">
                    Click the button above to generate a new trading signal.
                  </p>
                  <Button
                    onClick={handleGenerateSignal}
                    disabled={isGenerating}
                    className="gap-2 bg-gradient-primary"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate First Signal
                  </Button>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}
