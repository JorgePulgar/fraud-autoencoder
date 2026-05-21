import { HelpCircle } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export default function WhyPRAUCPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Why PR-AUC 0.37?"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end">
        <p className="font-mono text-xs font-semibold text-foreground mb-2">Why PR-AUC 0.37?</p>
        <div className="space-y-2 font-mono text-xs text-muted-foreground leading-relaxed">
          <p>
            A supervised classifier trained directly on the fraud labels would achieve PR-AUC well above 0.80 on this dataset — the signal is strong enough that gradient-boosted trees nearly saturate it.
          </p>
          <p>
            The autoencoder framing is not a metric competition. It is a demonstration that a model trained <em className="text-foreground not-italic">without any fraud labels</em> can still separate normal and anomalous reconstruction error distributions at inference time.
          </p>
          <p>
            That property matters in real deployments where labeled fraud data is scarce, delayed, or adversarially shifted. PR-AUC 0.37 on a held-out test set is the honest cost of unsupervised anomaly detection on a heavily imbalanced dataset (0.17 % fraud).
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
