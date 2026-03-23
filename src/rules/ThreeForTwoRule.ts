import { Product } from "../models/Product";
import { PricingRule } from "./PricingRule";

/**
 * "Buy 3, pay for 2" deal — generalised to any SKU.
 *
 * For every group of 3 units, the customer only pays for 2.
 * Remaining units outside a full group are charged at normal price.
 *
 * Example: 7 units → 2 full groups (pay for 4) + 1 remainder = pay for 5
 */
export class ThreeForTwoRule implements PricingRule {
    readonly sku: string;

    constructor(sku: string) {
        this.sku = sku;
    }

    apply(scannedItems: string[], catalogue: Record<string, Product>): number {
        const product = catalogue[this.sku];
        if (!product) return 0;

        const qty = scannedItems.filter((item) => item === this.sku).length;
        if (qty === 0) return 0;

        const fullGroups = Math.floor(qty / 3);
        const remainder = qty % 3;
        const chargeableUnits = fullGroups * 2 + remainder;

        return chargeableUnits * product.price;
    }
}