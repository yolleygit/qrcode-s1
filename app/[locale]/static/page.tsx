export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' },
  ];
}

export default function StaticPage() {
  return (
    <div>
      <h1>Static QR Code Generator</h1>
      <p>This page is under development.</p>
    </div>
  );
}