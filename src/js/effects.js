export function applyTiltEffect(cardElement) {
    cardElement.addEventListener("mousemove", (e) => {
      const rect = cardElement.getBoundingClientRect();
      const w = cardElement.clientWidth;
      const h = cardElement.clientHeight;
      const X = (e.clientX - rect.left) / w;
      const Y = (e.clientY - rect.top) / h;
      
      const rX = -(X - 0.5) * 26;
      const rY = (Y - 0.5) * 26;
      
      const bgX = 40 + 20 * X;
      const bgY = 40 + 20 * Y;
      
      document.documentElement.style.setProperty("--x", (100 * X) + "%");
      document.documentElement.style.setProperty("--y", (100 * Y) + "%");
      document.documentElement.style.setProperty("--bg-x", bgX + "%");
      document.documentElement.style.setProperty("--bg-y", bgY + "%");
      document.documentElement.style.setProperty("--r-x", rX + "deg");
      document.documentElement.style.setProperty("--r-y", rY + "deg");
    });
    
    cardElement.addEventListener("mouseleave", () => {
      document.documentElement.style.setProperty("--r-x", "0deg");
      document.documentElement.style.setProperty("--r-y", "0deg");
    });
  }
  