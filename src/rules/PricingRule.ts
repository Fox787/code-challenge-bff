import { Product } from "../models/Product";

/**
 * Every pricing rule receives the full list of scanned SKUs and the
 * catalogue, then returns the total price contribution for the SKUs
 * it is responsible for.
 *
 * Rules that don't apply to a given cart should return 0.
 */
export interface PricingRule {
    /** The SKU this rule targets */
    readonly sku: string;

    /**
     * Calculate the total price for the targeted SKU given the scanned items.
     * Returns 0 if the SKU is not present in the cart.
     */
    apply(scannedItems: string[], catalogue: Record<string, Product>): number;
}