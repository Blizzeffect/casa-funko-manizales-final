const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!;

export function goToWompiCheckout(totalCOP: number, reference: string) {
  if (totalCOP <= 0) return;

  const amountInCents = Math.round(totalCOP * 100);

  const params = new URLSearchParams({
    'public-key': WOMPI_PUBLIC_KEY,
    currency: 'COP',
    'amount-in-cents': amountInCents.toString(),
    reference,
    'redirect-url': 'https://casafunko.shop/gracias',
  });

  window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`;
}
