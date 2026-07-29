import './globals.css';
import './ui-refresh.css';
import { CartProvider } from '@/components/CartContext';

export const metadata = {
  title: 'Candle by Kinzee — Handcrafted Candles',
  description: 'Beautiful handcrafted candles made in small batches for every occasion. Weddings, birthdays, corporate gifting and more. Based in Indore, India.',
  keywords: 'handcrafted candles, soy wax candles, candle bouquets, wedding favours, return gifts, Indore',
  openGraph: {
    title: 'Candle by Kinzee',
    description: 'Beautiful handcrafted candles for every occasion.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
