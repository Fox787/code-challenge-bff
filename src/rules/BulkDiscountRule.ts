import { Product } from "../models/Product";
import { PricingRule } from "./PricingRule";

/**
 * Bulk discount rule — generalised to any SKU.
 *
 * If the quantity of a given SKU exceeds a threshold, the unit price
 * drops to a discounted price for ALL units in the cart.
 *
 * Example: Super iPad normally $549.99, drops to $499.99 if qty > 4
 */
export class BulkDiscountRule implements PricingRule {
    readonly sku: string;
    private readonly threshold: number;
    private readonly discountedPrice: number;

    /**
     * @param sku             The product SKU this rule applies to
     * @param threshold       Minimum quantity to trigger the discount (exclusive, i.e. qty > threshold)
     * @param discountedPrice The new unit price when the threshold is exceeded
     */
    constructor(sku: string, threshold: number, discountedPrice: number) {
        this.sku = sku;
        this.threshold = threshold;
        this.discountedPrice = discountedPrice;
    }

    apply(scannedItems: string[], catalogue: Record<string, Product>): number {
        const product = catalogue[this.sku];
        if (!product) return 0;

        const qty = scannedItems.filter((item) => item === this.sku).length;
        if (qty === 0) return 0;

        const unitPrice = qty > this.threshold ? this.discountedPrice : product.price;
        return qty * unitPrice;
    }
}