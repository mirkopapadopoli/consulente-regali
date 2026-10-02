import { isAndroid, isInstagram } from "../ambiente";

export function BannerInstagram() {
  const ua = navigator.userAgent;
  if (!isInstagram(ua)) return null;
  return (
    <div class="banner">
      {isAndroid(ua)
        ? "I pulsanti aprono direttamente l'app Amazon."
        : "Per acquistare con la tua app Amazon apri questa pagina nel browser: tocca ⋯ in alto e scegli “Apri nel browser”."}
    </div>
  );
}
