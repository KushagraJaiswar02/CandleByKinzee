const fs = require('fs');

const adminPagePath = 'app/admin/page.jsx';
let content = fs.readFileSync(adminPagePath, 'utf8');

// Add import
if (!content.includes('ConfirmDialog')) {
  content = content.replace(
    "import { X, Plus, LogOut, Package, RefreshCw, Star, Tag, Ticket, Settings, Bell, Search, Menu, LayoutDashboard, Calendar, ChevronRight, Copy } from 'lucide-react';",
    "import { X, Plus, LogOut, Package, RefreshCw, Star, Tag, Ticket, Settings, Bell, Search, Menu, LayoutDashboard, Calendar, ChevronRight, Copy } from 'lucide-react';\nimport ConfirmDialog from '@/components/ConfirmDialog';\nimport LoadingButton from '@/components/LoadingButton';"
  );
}

// Add state for ConfirmDialog
if (!content.includes('const [confirmState, setConfirmState]')) {
  content = content.replace(
    "const [submittingPrice, setSubmittingPrice] = useState(false);",
    "const [submittingPrice, setSubmittingPrice] = useState(false);\n  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirming: false });"
  );
}

// Modify deleteDiscount
const deleteDiscountRegex = /async function deleteDiscount\(id\)\s*\{\s*if \(\!confirm\('Are you sure you want to delete this coupon\?'\)\) return;\s*try\s*\{\s*await api\.delete\(`\/admin\/discounts\/\$\{id\}`\);\s*alert\('Coupon deleted successfully!'\);\s*fetchDiscounts\(\);\s*\}\s*catch\s*\(err\)\s*\{\s*alert\('Failed to delete coupon'\);\s*\}\s*\}/s;

const newDeleteDiscount = `function deleteDiscount(id) {
    setConfirmState({
      isOpen: true,
      title: 'Delete Coupon',
      message: 'Are you sure you want to delete this coupon? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isConfirming: true }));
        try {
          await api.delete(\`/admin/discounts/\${id}\`);
          fetchDiscounts();
        } catch (err) {
          // err handled globally
        } finally {
          setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirming: false });
        }
      }
    });
  }`;

content = content.replace(deleteDiscountRegex, newDeleteDiscount);

// Modify resolveTicket
const resolveTicketRegex = /async function resolveTicket\(id, action\)\s*\{\s*if \(\!confirm\(`Are you sure you want to \$\{action\} this cancellation request\?`\)\) return;\s*try\s*\{\s*await api\.post\(`\/admin\/cancellation-tickets\/\$\{id\}\/resolve`, \{ action \}\);\s*alert\(`Ticket successfully \$\{action === 'approve' \? 'Approved & Refunded' : 'Declined'\}`\);\s*fetchTickets\(\);\s*fetchOrders\(\);\s*\}\s*catch\s*\(err\)\s*\{\s*alert\(err\.response\?\.data\?\.message \|\| 'Failed to resolve ticket'\);\s*\}\s*\}/s;

const newResolveTicket = `function resolveTicket(id, action) {
    setConfirmState({
      isOpen: true,
      title: \`\${action === 'approve' ? 'Approve' : 'Decline'} Cancellation\`,
      message: \`Are you sure you want to \${action} this cancellation request?\`,
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isConfirming: true }));
        try {
          await api.post(\`/admin/cancellation-tickets/\${id}/resolve\`, { action });
          fetchTickets();
          fetchOrders();
        } catch (err) {
           // err handled globally
        } finally {
          setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirming: false });
        }
      }
    });
  }`;

content = content.replace(resolveTicketRegex, newResolveTicket);

// Inject the ConfirmDialog component near the end of the return statement
if (!content.includes('<ConfirmDialog isOpen={confirmState.isOpen}')) {
  // Find the last closing main div
  const lastDivIndex = content.lastIndexOf('</div>\n    </div>\n  );');
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
  '<button type="submit" className="login-submit-btn">\n              {loading ? \'Signing in...\' : \'Sign in to Atelier\'}\n            </button>',
  '<LoadingButton isLoading={loading} type="submit" className="login-submit-btn">\n              {loading ? \'Signing in...\' : \'Sign in to Atelier\'}\n            </LoadingButton>'
);

content = content.replace(
  '<button type="submit" disabled={submittingPrice} className="propose-price-submit-btn">\n                      {submittingPrice ? \'Sending Quote...\' : \'Submit & Email Proposal\'}\n                    </button>',
  '<LoadingButton isLoading={submittingPrice} type="submit" className="propose-price-submit-btn">\n                      {submittingPrice ? \'Sending Quote...\' : \'Submit & Email Proposal\'}\n                    </LoadingButton>'
);

// We won't risk global form-submit-btn replacement for now to keep things clean.

fs.writeFileSync(adminPagePath, content);
console.log('Patched admin page correctly');
