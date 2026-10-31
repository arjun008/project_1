# 🦖 T-Rex Dino Runner Game

A retro Chrome-style Dino Runner arcade game built using vanilla HTML5 Canvas, CSS3, and JavaScript with synthesized 8-bit sound effects powered by the Web Audio API (no external asset dependencies!).

![Dino Game Preview](https://raw.githubusercontent.com/arjun008/project_1/main/preview.png)

## 🎮 Features

- **Pixel-Art Graphics**: Custom procedural pixel-art sprites for the T-Rex (idle, running, ducking, jumping, and game-over states), cacti, and flying pterodactyls.
- **Dynamic Obstacles**:
  - Small, Double, Large, and Triple Cacti.
  - Animated flying Pterodactyls at three altitude levels (duck under high/mid ones, jump over low ones).
- **Day & Night Mode**: Dynamic smooth transitions between day and night cycles every 700 points with stars and moon.
- **Retro 8-bit Audio**: Synthesized sound effects for jumps, 100-point milestones, and game over collisions using the Web Audio API. Audio mute/unmute toggle included.
- **Score & High Score Tracking**: Real-time score counter and persistent local storage high-score tracking.
- **Responsive & Mobile Ready**: Full keyboard controls, canvas tap support, and on-screen touch buttons for mobile devices.
- **Zero External Runtime Dependencies**: Pure HTML, CSS, and JavaScript. Runs directly in any web browser without needing a build step or server.

---

## 🕹️ Controls

| Action | Keyboard | Mobile / Touch |
| :--- | :--- | :--- |
| **Jump** | `Space` or `↑ Up Arrow` | Tap canvas / Press "JUMP" button |
| **Duck** | `↓ Down Arrow` | Hold "DUCK" button |
| **Mute / Unmute** | `M` key | Click Sound button |
| **Restart** | `Space` or `Enter` | Tap "PLAY AGAIN" button |

---

## 🚀 How to Run Locally

1. Simply double-click [`index.html`](index.html) to open it in your favorite web browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve it using any local static web server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js npx
   npx serve .
   ```
   Then navigate to `http://localhost:8000` in your browser.

---

## 📦 Pushing to GitHub

To push this game to your repository (`https://github.com/arjun008/project_1.git`), run the following commands in your terminal inside this folder:

```bash
git init
git add .
git commit -m "Add simple T-Rex Dino runner game"
git branch -M main
git remote add origin https://github.com/arjun008/project_1.git
git push -u origin main
```
