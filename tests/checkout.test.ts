import { Checkout } from "../src/Checkout";
import { Catalogue } from "../src/Catalouge";
import { ThreeForTwoRule } from "../src/rules/ThreeForTwoRule";
import { BulkDiscountRule } from "../src/rules/BulkDiscountRule";

// Opening day pricing rules
const pricingRules = [
    new ThreeForTwoRule("atv"),
    new BulkDiscountRule("ipd", 4, 499.99),
];

const checkout = (skus: string[]) => {
    const co = new Checkout(pricingRules, Catalogue);
    skus.forEach((sku) => co.scan(sku));
    return co.total();
};

// ---------------------------------------------------------------------------
// README example scenarios
// ---------------------------------------------------------------------------
describe("README example scenarios", () => {
    test("atv, atv, atv, vga → $249.00", () => {
        expect(checkout(["atv", "atv", "atv", "vga"])).toBe(249.00);
    });

    test("atv, ipd, ipd, atv, ipd, ipd, ipd → $2718.95", () => {
        expect(checkout(["atv", "ipd", "ipd", "atv", "ipd", "ipd", "ipd"])).toBe(2718.95);
    });
});

// ---------------------------------------------------------------------------
// Apple TV 3-for-2 rule
// ---------------------------------------------------------------------------
describe("ThreeForTwoRule (Apple TV)", () => {
    test("1 Apple TV → full price", () => {
        expect(checkout(["atv"])).toBe(109.50);
    });

    test("2 Apple TVs → full price for both", () => {
        expect(checkout(["atv", "atv"])).toBe(219.00);
    });

    test("3 Apple TVs → pay for 2 only", () => {
        expect(checkout(["atv", "atv", "atv"])).toBe(219.00);
    });

    test("4 Apple TVs → pay for 3 (one group of 3 + 1 remainder)", () => {
        expect(checkout(["atv", "atv", "atv", "atv"])).toBe(328.50);
    });

    test("6 Apple TVs → pay for 4 (two full groups)", () => {
        expect(checkout(["atv", "atv", "atv", "atv", "atv", "atv"])).toBe(438.00);
    });

    test("3 Super Ipads → pay for 3  as  2/3 Void", () => {
        expect(checkout(["ipd", "ipd", "ipd"])).toBe(3 * 549.99);
    });
});

// ---------------------------------------------------------------------------
// Super iPad bulk discount rule
// ---------------------------------------------------------------------------
describe("BulkDiscountRule (Super iPad)", () => {
    test("1 iPad → standard price $549.99", () => {
        expect(checkout(["ipd"])).toBe(549.99);
    });

    test("4 iPads → standard price (threshold not exceeded)", () => {
        expect(checkout(["ipd", "ipd", "ipd", "ipd"])).toBe(4 * 549.99);
    });

    test("5 iPads → discounted price $499.99 each", () => {
        expect(checkout(["ipd", "ipd", "ipd", "ipd", "ipd"])).toBe(5 * 499.99);
    });

    test("10 iPads → discounted price $499.99 each", () => {
        expect(checkout(["ipd", "ipd", "ipd", "ipd", "ipd", "ipd", "ipd", "ipd", "ipd", "ipd"])).toBe(10 * 499.99);
    });
});

// ---------------------------------------------------------------------------
// Standard pricing (no rules)
// ---------------------------------------------------------------------------
describe("Standard pricing (no active rules)", () => {
    test("MacBook Pro at standard price", () => {
        expect(checkout(["mbp"])).toBe(1399.99);
    });

    test("VGA adapter at standard price", () => {
        expect(checkout(["vga"])).toBe(30.00);
    });

    test("MacBook Pro + VGA adapter", () => {
        expect(checkout(["mbp", "vga"])).toBe(1429.99);
    });
});

// ---------------------------------------------------------------------------
// Empty cart
// ---------------------------------------------------------------------------
describe("Edge cases", () => {
    test("empty cart → $0.00", () => {
        expect(checkout([])).toBe(0);
    });

    test("scanning order does not affect total", () => {
        const total1 = checkout(["atv", "ipd", "ipd", "atv", "ipd", "ipd", "ipd"]);
        const total2 = checkout(["ipd", "ipd", "ipd", "ipd", "ipd", "atv", "atv"]);
        expect(total1).toBe(total2);
    });

    test("unknown SKU throws an error", () => {
        const co = new Checkout(pricingRules, Catalogue);
        expect(() => co.scan("xyz")).toThrow('Unknown SKU: "xyz"');
    });

    test("rule targeting unknown SKU throws at construction time", () => {
        expect(
            () => new Checkout([new ThreeForTwoRule("xyz")], Catalogue)
        ).toThrow('Pricing rule targets unknown SKU: "xyz"');
    });

    test("checkout with no pricing rules uses standard prices", () => {
        const co = new Checkout([], Catalogue);
        co.scan("atv");
        co.scan("atv");
        co.scan("atv");
        expect(co.total()).toBe(3 * 109.50);
    });
});