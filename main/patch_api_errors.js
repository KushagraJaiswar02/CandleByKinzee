const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/api/admin/banners/route.js',
  'app/api/admin/discounts/route.js',
  'app/api/auth/login/route.js',
  'app/api/customer-auth/address/route.js',
  'app/api/customer-auth/profile/route.js',
  'app/api/customer-auth/request-otp/route.js',
  'app/api/customer-auth/verify-otp/route.js',
  'app/api/orders/[orderNumber]/cancel/route.js',
  'app/api/products/[id]/route.js',
  'app/api/products/route.js',
  'app/api/quotes/admin/[id]/quote/route.js',
  'app/api/quotes/route.js',
  'app/api/admin/discounts/[id]/route.js',
  'app/api/quotes/admin/[id]/route.js',
  'app/api/admin/cancellation-tickets/[id]/resolve/route.js'
];

for (const file of filesToUpdate) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Simple string replace for the common catch block patterns
  // We find 'catch (err) {' or 'catch (error) {'
  
  let match;
  const catchRegex = /catch\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*\{/g;
  
  let newContent = content;
  let matches = [];
  while ((match = catchRegex.exec(content)) !== null) {
      matches.push(match);
  }

  // We need to replace the entire catch block with return handleApiError(err);
  // To do this, we'll find the matching close brace for each catch block.
  // Actually, a simpler way is to just use a regular expression that consumes everything up to the next `}` that aligns, but that's hard.
  
  // Let's just find the `if (err instanceof z.ZodError)` and replace its parent block.
  
  if (content.includes('z.ZodError')) {
      const parts = content.split('catch (err) {');
      if (parts.length > 1) {
          let modifiedContent = parts[0];
          for (let i = 1; i < parts.length; i++) {
              let block = parts[i];
              if (block.includes('z.ZodError')) {
                  // find the end of this catch block
                  // assuming it ends with '}' and then the file ends or a new function starts.
                  // This is a bit hacky. Let's do a reliable bracket matcher:
                  let bracketCount = 1;
                  let j = 0;
                  for (; j < block.length; j++) {
                      if (block[j] === '{') bracketCount++;
                      if (block[j] === '}') bracketCount--;
                      if (bracketCount === 0) break;
                  }
                  
                  const rest = block.substring(j + 1);
                  modifiedContent += `catch (err) {\n    return handleApiError(err);\n  }${rest}`;
              } else {
                  modifiedContent += `catch (err) {${block}`;
              }
          }
          
          if (!modifiedContent.includes('handleApiError')) {
             modifiedContent = "import { handleApiError } from '@/lib/errorHandler';\n" + modifiedContent;
          }
          fs.writeFileSync(fullPath, modifiedContent);
          console.log('Updated', fullPath);
      }
  }
}
