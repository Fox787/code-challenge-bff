import { Checkout } from "./Checkout";
import { Catalogue } from "./Catalouge";
import { ThreeForTwoRule } from "./rules/ThreeForTwoRule";
import { BulkDiscountRule } from "./rules/BulkDiscountRule";

/**
 * Pricing rules for opening day specials.
 * To add or remove a rule, simply edit this array — nothing else changes.
 */
const pricingRules = [
    new ThreeForTwoRule("atv"),
    new BulkDiscountRule("ipd", 4, 499.99),

];

// --- Example scenario 1: atv, atv, atv, vga → $249.00 ---
const co1 = new Checkout(pricingRules, Catalogue);
co1.scan("atv");
co1.scan("atv");
co1.scan("atv");
co1.scan("vga");
console.log("Scenario 1 total:", co1.total()); // Expected: 249.00

// --- Example scenario 2: atv, ipd, ipd, atv, ipd, ipd, ipd → $2718.95 ---
const co2 = new Checkout(pricingRules, Catalogue);
co2.scan("atv");
co2.scan("ipd");
co2.scan("ipd");
co2.scan("atv");
co2.scan("ipd");
co2.scan("ipd");
co2.scan("ipd");
console.log("Scenario 2 total:", co2.total()); // Expected: 2718.95

