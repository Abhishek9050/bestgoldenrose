export default async (request) => {
  const url = new URL(request.url);

  const clickId = url.searchParams.get("click_id");
  const affiliateAmount = url.searchParams.get("affiliate_amount");
  const amount = url.searchParams.get("amount");
  const currency = url.searchParams.get("currency");
  const transactionType = url.searchParams.get("transaction_type");
  const transactionId = url.searchParams.get("transaction_id");
  const productId = url.searchParams.get("product_id");

  console.log({
    clickId,
    affiliateAmount,
    amount,
    currency,
    transactionType,
    transactionId,
    productId,
  });

  // Only send completed payments to Pinterest
  if (transactionType === "payment" && clickId && transactionId) {
    const accessToken = Netlify.env.get("PINTEREST_ACCESS_TOKEN");

    if (!accessToken) {
      console.error("PINTEREST_ACCESS_TOKEN is missing");
      return new Response("Pinterest token missing", { status: 500 });
    }

    const userAgent = request.headers.get("user-agent") || "";
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const clientIp = forwardedFor.split(",")[0].trim();

    const event = {
      data: [
        {
          event_name: "checkout",
          action_source: "web",
          event_time: Math.floor(Date.now() / 1000),
          event_id: transactionId,

          event_source_url:
            `https://bestgoldenrose.netlify.app/?epik=${encodeURIComponent(clickId)}`,

          user_data: {
            click_id: clickId,
            ...(clientIp && userAgent
              ? {
                  client_ip_address: clientIp,
                  client_user_agent: userAgent,
                }
              : {}),
          },

          custom_data: {
            currency: currency || "USD",
            value: amount,
            order_id: transactionId,
            content_ids: productId ? [productId] : [],
          },
        },
      ],
    };

    const pinterestResponse = await fetch(
      "https://api.pinterest.com/v5/ad_accounts/549770841236/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    const pinterestResult = await pinterestResponse.text();

    console.log("Pinterest response:", {
      status: pinterestResponse.status,
      body: pinterestResult,
    });
  }

  return new Response("OK", { status: 200 });
};
