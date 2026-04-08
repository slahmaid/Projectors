      (function () {
        "use strict";

        function formatDhAmount(n) {
          var num = parseInt(String(n), 10);
          if (isNaN(num)) return String(n);
          return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " درهم";
        }

        function discountPercent(sale, compare) {
          var s = parseInt(String(sale), 10);
          var c = parseInt(String(compare), 10);
          if (isNaN(s) || isNaN(c) || c <= 0 || s > c) return null;
          return Math.round((1 - s / c) * 100);
        }

        function initCodForm(form) {
          var saleEl = document.getElementById(form.getAttribute("data-price-sale-target"));
          var compareEl = document.getElementById(form.getAttribute("data-price-compare-target"));
          var discountEl = document.getElementById(form.getAttribute("data-discount-target"));
          var totalEl = form.querySelector(".cod-total-amount");
          var previewEl = document.getElementById(form.getAttribute("data-variant-img-target"));
          var qtyInput = form.querySelector(".cod-qty-input");
          var minusBtn = form.querySelector(".cod-qty-minus");
          var plusBtn = form.querySelector(".cod-qty-plus");
          var phoneInput = form.querySelector("[name='phone']");

          function trackPurchaseEvent(payload) {
            if (typeof window.fbq !== "function") return;
            window.fbq("track", "Purchase", payload || {});
          }

          function selectedVariant() {
            return form.querySelector(".variant-row input[type='radio']:checked");
          }

          function clampQty() {
            var n = parseInt(qtyInput.value, 10);
            if (isNaN(n) || n < 1) n = 1;
            if (n > 99) n = 99;
            qtyInput.value = String(n);
          }

          function syncForm() {
            var checked = selectedVariant();
            if (!checked) return;
            var sale = parseInt(checked.dataset.priceSale, 10);
            var compare = parseInt(checked.dataset.priceCompare, 10);
            var qty = parseInt(qtyInput.value, 10) || 1;

            if (saleEl) saleEl.textContent = String(sale);
            if (compareEl) compareEl.textContent = formatDhAmount(compare);
            if (discountEl) {
              var pct = discountPercent(sale, compare);
              if (pct !== null) {
                discountEl.innerHTML =
                  "خصم <span class=\"cta-price-discount-pct\" dir=\"ltr\">" + pct + "%</span>";
              }
            }
            if (totalEl) totalEl.textContent = formatDhAmount(sale * qty);
            if (previewEl) {
              previewEl.src = checked.dataset.variantImg || previewEl.src;
              previewEl.alt = checked.dataset.variantAlt || previewEl.alt;
            }
          }

          form.querySelectorAll(".variant-row input[type='radio']").forEach(function (el) {
            el.addEventListener("change", syncForm);
          });

          minusBtn.addEventListener("click", function () {
            qtyInput.value = String(Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1));
            clampQty();
            syncForm();
          });

          plusBtn.addEventListener("click", function () {
            qtyInput.value = String(Math.min(99, (parseInt(qtyInput.value, 10) || 1) + 1));
            clampQty();
            syncForm();
          });

          qtyInput.addEventListener("input", function () {
            clampQty();
            syncForm();
          });

          if (phoneInput) {
            function normalizePhone() {
              var digitsOnly = phoneInput.value.replace(/\D/g, "").slice(0, 10);
              phoneInput.value = digitsOnly;
              if (digitsOnly.length === 10) {
                phoneInput.setCustomValidity("");
              } else {
                phoneInput.setCustomValidity("رقم الهاتف يجب أن يتكون من 10 أرقام.");
              }
            }
            phoneInput.addEventListener("input", normalizePhone);
            normalizePhone();
          }

          form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  var submitBtn = form.querySelector(".cod-submit-btn");
  submitBtn.disabled = true;
  submitBtn.innerText = "جاري الإرسال...";

  var checked = selectedVariant();
  var formData = {
    fullname: form.querySelector("[name='fullname']").value.trim(),
    city: form.querySelector("[name='city']").value.trim(),
    address: form.querySelector("[name='address']").value.trim(),
    phone: form.querySelector("[name='phone']").value.replace(/\D/g, "").slice(0, 10),
    variant: checked ? checked.value.toUpperCase() : "-",
    qty: qtyInput.value,
    total: totalEl ? totalEl.textContent.trim() : "-"
  };

  var saleAmount = checked ? parseInt(checked.dataset.priceSale, 10) : NaN;
  var qtyAmount = parseInt(qtyInput.value, 10);
  var purchaseValue = !isNaN(saleAmount) && !isNaN(qtyAmount) ? saleAmount * qtyAmount : undefined;

  trackPurchaseEvent({
    currency: "MAD",
    value: purchaseValue,
    content_name: "Solar Projector",
    content_category: "Order Form CTA",
    content_type: "product",
    content_ids: [formData.variant],
    num_items: qtyAmount
  });

  // 1. Send data to Google Sheets
  const scriptURL = 'https://script.google.com/macros/s/AKfycbw7MA-DgdxVlfhjADbkIwQ2h6-LXOsvxRMI0TdVExX3GujsCh86jLZFSheM5GLNNio/exec';
  
  fetch(scriptURL, { 
    method: 'POST', 
    mode: 'no-cors', 
    body: new URLSearchParams(formData) 
  })
  .then(() => {
    // 2. Prepare WhatsApp Message
    var whatsappNumber = "212782385513"; // Use your actual number
    var message = "طلب جديد:\n" +
                  "- الموديل: " + formData.variant + "\n" +
                  "- الاسم: " + formData.fullname + "\n" +
                  "- الهاتف: " + formData.phone;

    var waUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
    var thankYouPath = "/thank-you";

    // Open WhatsApp first, then always move user to an existing thank-you page.
    var popup = window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = waUrl;
    }
    setTimeout(function () {
      window.location.href = thankYouPath;
    }, 700);
  })
  .catch(error => {
    console.error('Error!', error.message);
    submitBtn.disabled = false;
    submitBtn.innerText = "تأكيد الطلب الآن";
  });
});

          syncForm();
        }

        document.querySelectorAll(".cod-form").forEach(initCodForm);
      })();

      (function () {
        var header = document.getElementById("site-header");
        if (!header) return;
        var threshold = 8;
        function syncHeader() {
          var y = window.scrollY || window.pageYOffset || 0;
          if (y <= threshold) {
            header.classList.add("site-header--at-top");
          } else {
            header.classList.remove("site-header--at-top");
          }
        }
        window.addEventListener("scroll", syncHeader, { passive: true });
        window.addEventListener("resize", syncHeader);
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", syncHeader);
        } else {
          syncHeader();
        }
      })();

      (function () {
        var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        var targets = document.querySelectorAll(
          ".cta-inner, .feature-card, .split-showcase-inner, .review-card, .faq-item, .how-step, .mid-cta-media"
        );
        if (!targets.length) return;

        function setGroupDelay(selector, step, start) {
          var items = document.querySelectorAll(selector);
          if (!items.length) return;
          items.forEach(function (item, idx) {
            item.style.setProperty("--reveal-delay", String((start || 0) + idx * step) + "ms");
          });
        }

        setGroupDelay(".feature-card", 70, 20);
        setGroupDelay(".how-step", 80, 30);
        setGroupDelay(".review-card", 65, 20);
        setGroupDelay(".faq-item", 45, 10);

        targets.forEach(function (el) {
          el.classList.add("reveal-on-scroll");
        });

        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.14,
            rootMargin: "0px 0px -8% 0px"
          }
        );

        targets.forEach(function (el) {
          observer.observe(el);
        });
      })();

