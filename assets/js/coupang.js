(function () {
  "use strict";

  const money = new Intl.NumberFormat("ko-KR");

  function formatPrices(root) {
    root.querySelectorAll("[data-price]").forEach(function (node) {
      const value = Number(node.dataset.price);
      if (Number.isFinite(value)) node.textContent = money.format(value) + "원";
    });
  }

  function card(product) {
    const link = document.createElement("a");
    link.className = "cp-card";
    link.href = product.url;
    link.target = "_blank";
    link.rel = "nofollow sponsored noopener";

    const imageBox = document.createElement("div");
    imageBox.className = "cp-card-img";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    imageBox.appendChild(image);

    const body = document.createElement("div");
    body.className = "cp-card-body";
    const category = document.createElement("div");
    category.className = "cp-card-category";
    category.textContent = product.category;
    const name = document.createElement("div");
    name.className = "cp-card-name";
    name.textContent = product.name;
    const meta = document.createElement("div");
    meta.className = "cp-card-meta";
    const price = document.createElement("span");
    price.className = "cp-card-price";
    price.textContent = money.format(Number(product.price)) + "원";
    meta.appendChild(price);
    if (product.rocket === "true") {
      const badge = document.createElement("span");
      badge.className = "cp-badge";
      badge.textContent = "로켓";
      meta.appendChild(badge);
    }
    body.append(category, name, meta);
    link.append(imageBox, body);
    return link;
  }

  function setupSearch(search) {
    const form = search.querySelector("[data-search-form]");
    const input = search.querySelector("[data-search-input]");
    const status = search.querySelector("[data-search-status]");
    const results = search.querySelector("[data-search-results]");
    const seen = new Set();
    const products = Array.from(search.querySelectorAll("[data-product]")).map(function (node) {
      return Object.assign({}, node.dataset);
    }).filter(function (product) {
      if (!product.url || seen.has(product.url)) return false;
      seen.add(product.url);
      product.searchText = [product.name, product.fullName, product.category]
        .join(" ").toLocaleLowerCase("ko-KR");
      return true;
    });

    function run(query) {
      const normalized = query.trim().toLocaleLowerCase("ko-KR");
      results.replaceChildren();
      if (!normalized) {
        results.hidden = true;
        status.textContent = "검색어를 입력하면 현재 확인된 상품 " + products.length + "개에서 찾아드립니다.";
        return;
      }
      const matched = products.filter(function (product) {
        return product.searchText.includes(normalized);
      });
      matched.slice(0, 12).forEach(function (product) { results.appendChild(card(product)); });
      results.hidden = false;
      status.textContent = matched.length
        ? "‘" + query.trim() + "’ 검색 결과 " + matched.length + "개" + (matched.length > 12 ? " · 상위 12개 표시" : "")
        : "‘" + query.trim() + "’ 검색 결과가 없습니다.";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      run(input.value);
    });
    input.addEventListener("input", function () { run(input.value); });
    search.querySelectorAll("[data-search-chip]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.dataset.searchChip;
        run(input.value);
        input.focus();
      });
    });
    run("");
  }

  function setupCarousel(carousel) {
    const row = carousel.querySelector(".cp-row");
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    if (!row || !previous || !next) return;
    const step = function () { return Math.max(180, Math.round(row.clientWidth * 0.72)); };
    previous.addEventListener("click", function () { row.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { row.scrollBy({ left: step(), behavior: "smooth" }); });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let timer;
      const start = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
          row.scrollTo({ left: atEnd ? 0 : row.scrollLeft + step(), behavior: "smooth" });
        }, 5000);
      };
      const stop = function () { window.clearInterval(timer); };
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      carousel.addEventListener("focusin", stop);
      carousel.addEventListener("focusout", start);
      start();
    }
  }

  // 광고 차단 확장은 ads-partners.coupang.com 스크립트를 통째로 제거한다
  // (실측: script 태그 자체가 DOM 에서 사라지고 PartnersCoupang 이 undefined).
  // 그러면 위젯 슬롯이 빈 채로 남으므로 자체 상품 카드를 대신 띄운다.
  function reviveBlockedWidgets() {
    let revived = 0;
    document.querySelectorAll("[data-widget-slot]").forEach(function (slot) {
      if (slot.querySelector("iframe")) return;  // 위젯이 떴다
      const fb = slot.querySelector("[data-widget-fallback]");
      if (!fb || !fb.hidden) return;
      fb.hidden = false;
      revived += 1;
      formatPrices(fb);
      fb.querySelectorAll("[data-carousel]").forEach(setupCarousel);
    });
    return revived;
  }

  document.addEventListener("DOMContentLoaded", function () {
    formatPrices(document);
    document.querySelectorAll("[data-product-search]").forEach(setupSearch);
    document.querySelectorAll("[data-carousel]").forEach(setupCarousel);
    // 위젯 iframe 이 붙을 시간을 준 뒤 판정한다.
    window.setTimeout(reviveBlockedWidgets, 1500);
    window.setTimeout(reviveBlockedWidgets, 4000);
  });
}());
