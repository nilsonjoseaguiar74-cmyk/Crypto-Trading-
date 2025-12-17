import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Target, 
  ShieldAlert,
  Brain,
  Sparkles
} from 'lucide-react';
import { Signal } from '@/store/signalStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SignalCardProps {
  signal: Signal;
  index: number;
}

export function SignalCard({ signal, index }: SignalCardProps) {
  const getActionConfig = (action: Signal['action']) => {
    switch (action) {
      case 'BUY':
        return {
          icon: TrendingUp,
          color: 'text-success',
          bg: 'bg-success/10',
          border: 'border-success/30',
          label: 'BUY',
        };
      case 'SELL':
        return {
          icon: TrendingDown,
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          label: 'SELL',
        };
      default:
        return {
          icon: Minus,
          color: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          label: 'HOLD',
        };
    }
  };

  const config = getActionConfig(signal.action);
  const ActionIcon = config.icon;

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className={`glass relative overflow-hidden ${signal.isNew ? 'animate-pulse-glow' : ''}`}>
        {signal.isNew && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary">
              <Sparkles className="h-3 w-3" />
              New
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <ActionIcon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{signal.token}</CardTitle>
                <p className="text-sm text-muted-foreground font-mono">{signal.symbol}</p>
              </div>
            </div>
            <Badge className={`${config.bg} ${config.color} ${config.border} border font-semibold`}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" />
              <span>AI Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signal.confidence}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className={`h-full ${signal.confidence >= 80 ? 'bg-success' : signal.confidence >= 60 ? 'bg-warning' : 'bg-destructive'}`}
                />
              </div>
              <span className="font-mono text-sm font-medium">{signal.confidence}%</span>
            </div>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">Current Price</p>
              <p className="font-mono font-medium">{formatPrice(signal.price)}</p>
            </div>
            <div className="p-2 rounded-lg bg-success/10">
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <Target className="h-3 w-3" /> Alvo
              </p>
              <p className="font-mono font-medium text-success">{formatPrice(signal.targetPrice)}</p>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10">
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Stop
              </p>
              <p className="font-mono font-medium text-destructive">{formatPrice(signal.stopLoss)}</p>
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {signal.reasoning}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTime(signal.timestamp)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
