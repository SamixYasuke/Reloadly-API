const giftCards = Array.from(document.querySelectorAll(".gift-card"));

giftCards.forEach((giftCard) => {
  giftCard.addEventListener("click", () => {
    const productIdElement = giftCard.querySelector(".card-text:nth-child(4)");
    if (productIdElement) {
      const productId = productIdElement.innerText.trim().split(":")[1].trim();
      const redirectUrl = `/giftcards/${productId}`;
      window.location.href = redirectUrl;
    }
  });
});
