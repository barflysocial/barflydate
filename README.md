# BARFLYDATE_v41_RESEND_20260427_1901

Complete full ZIP build. No patches.

## v41 — Save to Home Screen Guide
Rebuilt from v40.

### Post-splash prompt
After the splash screen, first-time visitors see a prompt that offers a quick guide for saving Barfly Social to their phone home screen.

Buttons:
- Show Me
- Maybe Later
- Don’t Show Again

### Device-specific tutorial
If the user taps **Show Me**, they see a lightweight animated tutorial with instructions for:
- iPhone / Safari
- Android / Chrome

### Return flow
After the tutorial, users continue to the app’s configured homepage destination.

### Don’t-show-again memory
If the user taps **Don’t Show Again**, the prompt is saved in local storage and will not appear on later visits on that device/browser.

## Deployment note
This ZIP is Render-ready. `package.json`, `client/`, `server/`, and `render.yaml` are at the ZIP root.
