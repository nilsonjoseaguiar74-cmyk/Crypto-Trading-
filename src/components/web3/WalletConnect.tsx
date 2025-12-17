import { motion } from 'framer-motion';
import { Wallet, Loader2, LogOut, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function WalletConnect() {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    hasAccess,
    error, 
    connect, 
    disconnect,
    checkMetaMask 
  } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              variant="outline" 
              className="gap-2 border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                {hasAccess && (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
                <span className="font-mono text-sm">{formatAddress(address)}</span>
              </div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Carteira Conectada</p>
              <p className="text-xs text-muted-foreground font-mono">
                {formatAddress(address)}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2">
            <CheckCircle className={`h-4 w-4 ${hasAccess ? 'text-success' : 'text-muted-foreground'}`} />
            <span>{hasAccess ? 'Acesso Ativo' : 'Sem Acesso'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={disconnect}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Desconectar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span>Conectar Carteira</span>
          </>
        )}
      </Button>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-destructive text-xs mt-2 text-center max-w-[200px]"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
