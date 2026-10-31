# 🦖 T-Rex Dino Runner Game

A retro Chrome-style Dino Runner arcade game built using vanilla HTML5 Canvas, CSS3, and JavaScript with synthesized 8-bit sound effects powered by the Web Audio API.

**Fully optimized for both Desktop and Mobile devices!**

---

## 🎮 Features

- **📱 Mobile & Touch Optimized**:
  - **Swipe Gestures**: Swipe **UP** anywhere on screen to Jump, swipe **DOWN** to Duck.
  - **Screen Tap**: Quick tap anywhere on screen jumps / restarts.
  - **Thumb-Friendly Touch Arcade Controls**: Dedicated large on-screen **⬆ JUMP** and **⬇ DUCK** buttons.
  - **Zero-Zoom / Zero-Scroll**: Screen locking (`touch-action: none`) prevents accidental page scrolling or pinching while playing on mobile.
  - **Mobile Audio Unlock**: Web Audio API unlocks on initial screen touch for crisp 8-bit sound on iOS and Android.
- **Pixel-Art Graphics**: Custom procedural pixel-art sprites for the T-Rex (idle, running, ducking, jumping, and game-over states), cacti, and flying pterodactyls.
- **Dynamic Obstacles**:
  - Small, Double, Large, and Triple Cacti.
  - Animated flying Pterodactyls at three altitude levels (duck under high/mid ones, jump over low ones).
- **Day & Night Mode**: Dynamic smooth transitions between day and night cycles every 700 points with stars and moon.
- **Score & High Score Tracking**: Real-time score counter with local storage high-score persistence.
- **Zero External Runtime Dependencies**: Pure HTML, CSS, and JavaScript. Runs directly in any web browser without build tools or servers.

---

## 🕹️ Controls

| Action | Desktop / Laptop | Mobile / Tablet |
| :--- | :--- | :--- |
| **Jump** | `Space` or `↑ Up Arrow` | **Tap screen**, **Swipe ↑**, or tap **⬆ JUMP** button |
| **Duck** | `↓ Down Arrow` | **Swipe ↓** (hold) or hold **⬇ DUCK** button |
| **Mute / Unmute** | `M` key | Tap **🔊 Sound** button |
| **Restart** | `Space` or `Enter` | Tap screen or tap **PLAY AGAIN** |

---

## 🌐 How to Play on Mobile via GitHub Pages

You can play this game directly on your phone's browser for free:

1. Go to your repository settings: [https://github.com/arjun008/project_1/settings/pages](https://github.com/arjun008/project_1/settings/pages)
2. Under **Build and deployment > Branch**, select **`main`** and folder **`/ (root)`**, then click **Save**.
3. In ~1 minute, GitHub will give you a live link:
   `https://arjun008.github.io/project_1/`
4. Open that link on your smartphone to play anywhere!

---

## 💻 How to Run Locally

1. Simply double-click [`index.html`](index.html) to open it in your web browser.
2. Or serve it via any static server:
   ```bash
   python -m http.server 8000
   ```
