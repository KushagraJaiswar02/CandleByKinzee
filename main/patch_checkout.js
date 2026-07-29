const fs = require('fs');

const checkoutPagePath = 'app/checkout/page.jsx';
let content = fs.readFileSync(checkoutPagePath, 'utf8');

// Add import
if (!content.includes('LoadingButton')) {
  content = content.replace(
    "import { ShoppingBag, ArrowLeft, Loader2, CheckCircle2, ChevronRight, X, Shield, Plus } from 'lucide-react';",
    "import { ShoppingBag, ArrowLeft, Loader2, CheckCircle2, ChevronRight, X, Shield, Plus } from 'lucide-react';\nimport LoadingButton from '@/components/LoadingButton';"
  );
}

// Find key submit/action buttons
// 1. "Continue to Delivery" button
content = content.replace(
  '<button\n                type="submit"\n                disabled={submitting}\n                className="checkout-next-step-btn"\n              >',
  '<LoadingButton\n                type="submit"\n                isLoading={submitting}\n                className="checkout-next-step-btn"\n              >'
);
content = content.replace(
  '              </button>\n            </form>\n          </div>',
  '              </LoadingButton>\n            </form>\n          </div>'
); // this might be risky, let's use string replace carefully.

// A safer way: replace complete <button ...>...</button> string blocks.
content = content.replace(
  /<button\s+type="submit"\s+disabled=\{submitting\}\s+className="checkout-next-step-btn"\s*>\s*\{submitting \? 'Saving...' : 'Continue to Delivery'\}\s*<\/button>/g,
  '<LoadingButton type="submit" isLoading={submitting} className="checkout-next-step-btn">\n                {submitting ? \'Saving...\' : \'Continue to Delivery\'}\n              </LoadingButton>'
);

// 2. "Continue to Payment" button
content = content.replace(
  /<button\s+type="button"\s+onClick=\{onNext\}\s+disabled=\{!deliveryRate \|\| submitting\}\s+className="checkout-next-step-btn"\s*>\s*Continue to Payment\s*<\/button>/g,
  '<LoadingButton type="button" onClick={onNext} isLoading={submitting} disabled={!deliveryRate} className="checkout-next-step-btn">\n            Continue to Payment\n          </LoadingButton>'
);

// 3. "Place Order & Pay" button
content = content.replace(
  /<button\s+type="button"\s+onClick=\{handlePlaceOrder\}\s+disabled=\{submitting\}\s+className="checkout-next-step-btn place-order-btn"\s*>\s*\{submitting \? 'Processing...' : `Pay ₹\$\{totalAmount\}`\}\s*<\/button>/g,
  '<LoadingButton type="button" onClick={handlePlaceOrder} isLoading={submitting} className="checkout-next-step-btn place-order-btn">\n            {submitting ? \'Processing...\' : `Pay ₹${totalAmount}`}\n          </LoadingButton>'
);

// 4. "Apply" promo button
content = content.replace(
  /<button\s+type="button"\s+onClick=\{handleApplyPromo\}\s+disabled=\{!promoInput\.trim\(\) \|\| applyingPromo\}\s+className="promo-apply-btn"\s*>\s*\{applyingPromo \? '...' : 'Apply'\}\s*<\/button>/g,
  '<LoadingButton type="button" onClick={handleApplyPromo} isLoading={applyingPromo} disabled={!promoInput.trim()} className="promo-apply-btn">\n                {applyingPromo ? \'...\' : \'Apply\'}\n              </LoadingButton>'
);

fs.writeFileSync(checkoutPagePath, content);
console.log('Patched checkout page correctly');
