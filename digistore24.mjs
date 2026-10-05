export default async (request) => {
  const url = new URL(request.url);

  const clickId = url.searchParams.get("click_id");
  const affiliateAmount = url.searchParams.get("affiliate_amount");
  const currency = url.searchParams.get("currency");
  const transactionType = url.searchParams.get("transaction_type");
  const transactionId = url.searchParams.get("transaction_id");
  const productId = url.searchParams.get("product_id");

  console.log({
    clickId,
    affiliateAmount,
    currency,
    transactionType,
    transactionId,
    productId,
  });

  return new Response("OK", { status: 200 });
};