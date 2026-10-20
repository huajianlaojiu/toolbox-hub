(function(){
  var buttons = document.querySelectorAll(".filter-btn");
  var grid = document.getElementById("tools-grid");
  var label = document.getElementById("filter-label");
  var count = document.getElementById("filter-count");
  if (!buttons.length || !grid) return;

  var cards = Array.from(grid.children);
  var allCards = cards.map(function(el, i){ return {el:el, cat:el.getAttribute("data-cat")}; });

  buttons.forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.preventDefault();
      var filter = this.getAttribute("data-filter");
      buttons.forEach(function(b){ b.className = "filter-btn rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30"; });
      this.className = "filter-btn rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium";
      label.textContent = filter;
      var shown = 0;
      allCards.forEach(function(c){
        if (filter === "All Tools" || c.cat === filter) { c.el.style.display = ""; shown++; }
        else { c.el.style.display = "none"; }
      });
      count.textContent = shown;
    });
  });
})();