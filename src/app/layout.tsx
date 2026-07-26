import './globals.css';

export const metadata = {
  title: 'One Finance - Portal do Cliente',
  description: 'Portal Financeiro One Finance BPO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR'>
      <body>{children}</body>
    </html>
  );
}