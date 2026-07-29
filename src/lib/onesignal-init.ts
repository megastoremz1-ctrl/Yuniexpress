"use client";

export function initOneSignal() {
  if (typeof window === "undefined") return;
  
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) return;

  // Load OneSignal SDK
  const script = document.createElement("script");
  script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
  script.defer = true;
  script.onload = () => {
    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.init({
        appId,
        safari_web_id: "",
        notifyButton: {
          enable: true,
          size: "medium",
          position: "bottom-right",
          prenotify: true,
          showCredit: false,
          text: {
            "tip.state.unsubscribed": "Subscrever notificações",
            "tip.state.subscribed": "Está subscrito",
            "tip.state.blocked": "Notificações bloqueadas",
            "dialog.main.title": "Gerir Notificações",
            "dialog.main.button.subscribe": "SUBSCREVER",
            "dialog.main.button.unsubscribe": "CANCELAR",
          },
        },
        welcomeNotification: {
          title: "Bem-vindo ao YuniExpress!",
          message: "Obrigado por subscrever. Receberá ofertas exclusivas!",
        },
      });
    });
  };
  document.head.appendChild(script);
}

// Set external user ID for targeted notifications
export function setOneSignalExternalUserId(userId: string) {
  if (typeof window === "undefined") return;
  
  (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
  (window as any).OneSignalDeferred.push(async function (OneSignal: any) {
    await OneSignal.login(userId);
  });
}

// Remove user on logout
export function removeOneSignalExternalUserId() {
  if (typeof window === "undefined") return;
  
  (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
  (window as any).OneSignalDeferred.push(async function (OneSignal: any) {
    await OneSignal.logout();
  });
}
