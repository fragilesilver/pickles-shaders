// Before/after comparison slider (see _includes/compare.html).
document.querySelectorAll(".cmp").forEach(function (fig) {
  var frame = fig.querySelector(".cmp-frame");
  var range = fig.querySelector(".cmp-range");
  var dragging = false;

  function set(pct) {
    pct = Math.max(0, Math.min(100, pct));
    fig.style.setProperty("--pos", pct + "%");
    range.value = Math.round(pct);
  }

  function fromPointer(e) {
    var r = frame.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  }

  frame.addEventListener("pointerdown", function (e) {
    dragging = true;
    try { frame.setPointerCapture(e.pointerId); } catch (err) {}
    range.focus({ preventScroll: true });
    fromPointer(e);
  });
  frame.addEventListener("pointermove", function (e) {
    if (dragging) fromPointer(e);
  });
  ["pointerup", "pointercancel"].forEach(function (type) {
    frame.addEventListener(type, function () { dragging = false; });
  });

  range.addEventListener("input", function () { set(+range.value); });
  set(+range.value);
});
