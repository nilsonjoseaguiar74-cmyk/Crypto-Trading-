import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketData } from '@/store/signalStore';
import { Card, CardContent } from '@/components/ui/card';

interface MarketOverviewProps {
  data: MarketData[];
  isLoading: boolean;
}

export function MarketOverview({ data, isLoading }: MarketOverviewProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    return `$${(volume / 1e3).toFixed(1)}K`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {data.map((coin, index) => (
        <motion.div
          key={coin.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="glass hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=0066FF&color=fff`;
                    }}
                  />
                  <div>
                    <p className="font-semibold text-sm">{coin.symbol}</p>
                    <p className="text-xs text-muted-foreground">{coin.name}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  coin.change24h >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {coin.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="font-mono font-semibold">{formatPrice(coin.price)}</p>
                <p className="text-xs text-muted-foreground">Vol {formatVolume(coin.volume24h)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
