const fs = require('fs');

const trackPagePath = 'app/track/page.jsx';
let content = fs.readFileSync(trackPagePath, 'utf8');

// Add import
if (!content.includes('ConfirmDialog')) {
  content = content.replace(
    "import { ShoppingBag, ArrowLeft, Loader2, PlayCircle, MapPin, Search, ChevronRight, MessageSquare, Plus, Edit2, CheckCircle2, User, HelpCircle, X, Shield, Lock, CreditCard } from 'lucide-react';",
    "import { ShoppingBag, ArrowLeft, Loader2, PlayCircle, MapPin, Search, ChevronRight, MessageSquare, Plus, Edit2, CheckCircle2, User, HelpCircle, X, Shield, Lock, CreditCard } from 'lucide-react';\nimport ConfirmDialog from '@/components/ConfirmDialog';\nimport LoadingButton from '@/components/LoadingButton';"
  );
}

// Add state for ConfirmDialog
if (!content.includes('const [confirmState, setConfirmState]')) {
  content = content.replace(
    "const [addressMode, setAddressMode] = useState('saved');",
    "const [addressMode, setAddressMode] = useState('saved');\n  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirming: false });"
  );
}

// Modify triggerCustomerCancel
const triggerCustomerCancelRegex = /async function triggerCustomerCancel\(ord\)\s*\{\s*if \(\!confirm\('Are you sure you want to cancel this order\?'\)\) return;\s*try\s*\{\s*const contactVal = customer\?\.email \|\| ord\.customer\.phone;\s*await api\.post\(`\/orders\/\$\{ord\.orderNumber\}\/cancel`, \{\s*phone: contactVal,\s*reason: 'Cancelled by customer via dashboard'\s*\}\);\s*alert\('Order cancelled successfully\.'\);\s*checkLoggedInUser\(\);\s*\}\s*catch\s*\(err\)\s*\{\s*alert\(err\.response\?\.data\?\.message \|\| 'Failed to cancel order\.'\);\s*\}\s*\}/s;

const newTriggerCustomerCancel = `function triggerCustomerCancel(ord) {
    setConfirmState({
      isOpen: true,
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? If you have paid, your refund will be processed within 5 days after our team accepts your request.',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isConfirming: true }));
        try {
          const contactVal = customer?.email || ord.customer.phone;
          await api.post(\`/orders/\${ord.orderNumber}/cancel\`, {
            phone: contactVal,
            reason: 'Cancelled by customer via dashboard'
          });
          checkLoggedInUser();
        } catch (err) {
          // err handled globally
        } finally {
          setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirming: false });
        }
      }
    });
  }`;

content = content.replace(triggerCustomerCancelRegex, newTriggerCustomerCancel);

// Inject the ConfirmDialog component near the end of the return statement
if (!content.includes('<ConfirmDialog isOpen={confirmState.isOpen}')) {
  // Find the last closing Layout tag
  const lastDivIndex = content.lastIndexOf('</Layout>');
  if (lastDivIndex !== -1) {
    const dialogComponent = `
      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        isConfirming={confirmState.isConfirming}
        onCancel={() => setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirming: false })}
      />\n`;
    content = content.slice(0, lastDivIndex) + dialogComponent + content.slice(lastDivIndex);
  }
}

// Safely replace specific buttons with complete replacement tags
content = content.replace(
  '<button type="submit" disabled={authLoading}>\n                      {authLoading ? \'Sending...\' : \'Send OTP\'}\n                    </button>',
  '<LoadingButton isLoading={authLoading} type="submit">\n                      {authLoading ? \'Sending...\' : \'Send OTP\'}\n                    </LoadingButton>'
);

content = content.replace(
  '<button type="submit" disabled={authLoading}>\n                        {authLoading ? \'Verifying...\' : \'Verify & Login\'}\n                      </button>',
  '<LoadingButton isLoading={authLoading} type="submit">\n                        {authLoading ? \'Verifying...\' : \'Verify & Login\'}\n                      </LoadingButton>'
);

fs.writeFileSync(trackPagePath, content);
console.log('Patched track page correctly');
