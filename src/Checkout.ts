import { Product } from "./models/Product";
import { PricingRule } from "./rules/PricingRule";

/**
 * Checkout system for Zeller's computer store.
 *
 * Accepts a list of pricing rules at construction time — making it easy
 * to swap, add, or remove rules without modifying this class.
 *
 * Usage:
 *   const co = new Checkout(pricingRules, catalogue);
 *   co.scan("atv");
 *   co.scan("ipd");
 *   co.total(); // → number
 */
export class Checkout {
    private readonly pricingRules: PricingRule[];
    private readonly catalogue: Record<string, Product>;
    private scannedItems: string[] = [];

    constructor(pricingRules: PricingRule[], catalogue: Record<string, Product>) {
        // Validate that every rule targets a SKU that actually exists in the catalogue.
        // This catches misconfiguration at setup time rather than silently producing wrong totals.
        for (const rule of pricingRules) {
            if (!catalogue[rule.sku]) {
                throw new Error(
                    `Pricing rule targets unknown SKU: "${rule.sku}". Check your catalogue.`
                );
            }
        }

        this.pricingRules = pricingRules;
        this.catalogue = catalogue;
    }

    /** Scan a single item by SKU into the cart */
    scan(sku: string): void {
        if (!this.catalogue[sku]) {
            throw new Error(`Unknown SKU: "${sku}"`);
        }
        this.scannedItems.push(sku);
    }

    /**
     * Calculate the total price for all scanned items.
     *
     * For each SKU in the cart:
     *  - If a pricing rule exists for it, delegate pricing to that rule
     *  - Otherwise, charge the standard catalogue price
     *
     * Returns the total rounded to 2 decimal places.
     */
    total(): number {
        // Build a set of SKUs that have a rule, for fast lookup
        const ruledSkus = new Set(this.pricingRules.map((r) => r.sku));

        // Sum up ruled SKUs via their rules
        const ruledTotal = this.pricingRules.reduce((sum, rule) => {
            return sum + rule.apply(this.scannedItems, this.catalogue);
        }, 0);

        // Sum up any SKUs with no rule at standard price
        const standardTotal = this.scannedItems
            .filter((sku) => !ruledSkus.has(sku))
            .reduce((sum, sku) => sum + this.catalogue[sku].price, 0);

        return Math.round((ruledTotal + standardTotal) * 100) / 100;
    }
}