import { motion } from 'framer-motion';
import { Lock, Wallet, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

export function AccessGate() {
  const { connect, isConnecting, checkMetaMask } = useWallet();

  const hasMetaMask = checkMetaMask();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="glass rounded-2xl p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow"
        >
          <Lock className="h-10 w-10 text-primary-foreground" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold mb-4"
        >
          Acesso Exclusivo
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          Conecte sua carteira para verificar suas permissões on-chain e acessar os sinais de trading gerados pela nossa IA.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {hasMetaMask ? (
            <Button
              onClick={connect}
              disabled={isConnecting}
              size="lg"
              className="w-full gap-2 bg-gradient-primary hover:opacity-90 transition-all shadow-glow text-lg py-6"
            >
              <Wallet className="h-5 w-5" />
              {isConnecting ? 'Verificando...' : 'Conectar MetaMask'}
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          ) : (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 border-primary/30 hover:bg-primary/10 text-lg py-6"
              >
                <Wallet className="h-5 w-5" />
                Instalar MetaMask
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </a>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-border/50"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Validação via Smart Contract na Sepolia Testnet</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
