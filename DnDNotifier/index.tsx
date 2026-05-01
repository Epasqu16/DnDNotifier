import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { findByProps } from "@webpack";
import { React } from "@webpack/common";

// ── Dış store referansları
let UserStore: any;
let PresenceStore: any;
let ChannelStore: any;

// ── Ses motoru
let audio: HTMLAudioElement = new Audio();
let currentSoundUrl: string = "";

// ── Cooldown takibi
let lastPlayedAt: number = 0;

// ── Varsayılan ses (boş = çalma)
const defaultSound: string = "data:audio/mp3;base64,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";

// ── Kullanıcı başına ses verisi tipi
interface UserSound {
    userId: string;
    label: string;
    url: string;
    fileName: string;
}

// ── Discord kanal tipleri
const CHANNEL_TYPE_DM    = 1;
const CHANNEL_TYPE_GROUP = 3;

// ══════════════════════════════════════════════════════════════
//  i18n
// ══════════════════════════════════════════════════════════════
const i18n = {
    en: {
        langLabel:             "Language",
        sectionDefault:        "🔔  Default Sound",
        urlLabel:              "Sound URL",
        urlPlaceholder:        "https://files.catbox.moe/xxx.mp3",
        urlDesc:               "Direct MP3 / WAV / OGG / AAC / WEBM link",
        uploadBtn:             "📁  Upload Sound File",
        testBtn:               "🔊  Test",
        resetBtn:              "🔄  Reset",
        fileLoaded:            "✅  Loaded: ",
        invalidUrl:            "⚠️  Invalid URL! Must end with .mp3 / .wav / .ogg / .aac / .webm",
        sectionVolume:         "🔈  Volume",
        sectionBehavior:       "⚙️  Behavior",
        enabledLabel:          "Enable Sounds",
        enabledDesc:           "Quickly pause/resume without disabling the plugin.",
        onlyMentionsLabel:     "@Mentions Only",
        onlyMentionsDesc:      "Only play sound when you are directly mentioned.",
        groupDMsLabel:         "Include Group DMs",
        groupDMsDesc:          "Also play for messages in group DM channels.",
        cooldownLabel:         "Cooldown (seconds)",
        cooldownDesc:          "Minimum wait time between sounds to prevent spam. (0 = disabled)",
        exportBtn:             "💾  Export Config",
        importBtn:             "📂  Import Config",
        importSuccess:         "✅  Config imported successfully!",
        importError:           "⚠️  Invalid config file.",
        perUserTitle:          "🎵  Per-User Custom Sounds",
        perUserDesc:           "Assign a different sound to specific users.",
        addUserBtn:            "➕  Add User",
        removeBtn:             "✕",
        userIdPlaceholder:     "Discord User ID",
        userLabelPlaceholder:  "Note (e.g. John)",
        userUrlPlaceholder:    "Sound URL",
        uploadForUser:         "📁",
        testForUser:           "🔊",
        noUsers:               "No custom users added yet.",
    },
    tr: {
        langLabel:             "Dil",
        sectionDefault:        "🔔  Varsayılan Ses",
        urlLabel:              "Ses URL'si",
        urlPlaceholder:        "https://files.catbox.moe/xxx.mp3",
        urlDesc:               "Direkt MP3 / WAV / OGG / AAC / WEBM linki gir",
        uploadBtn:             "📁  Bilgisayardan Ses Yükle",
        testBtn:               "🔊  Test",
        resetBtn:              "🔄  Sıfırla",
        fileLoaded:            "✅  Yüklendi: ",
        invalidUrl:            "⚠️  Geçersiz URL! .mp3 / .wav / .ogg / .aac / .webm ile bitmeli.",
        sectionVolume:         "🔈  Ses Seviyesi",
        sectionBehavior:       "⚙️  Davranış Ayarları",
        enabledLabel:          "Sesleri Etkinleştir",
        enabledDesc:           "Plugin'i devre dışı bırakmadan hızlıca duraklat/devam et.",
        onlyMentionsLabel:     "Yalnızca @Bahsetme",
        onlyMentionsDesc:      "Yalnızca doğrudan bahsedildiğinde ses çal.",
        groupDMsLabel:         "Grup DM'leri Dahil Et",
        groupDMsDesc:          "Grup DM kanallarındaki mesajlarda da ses çal.",
        cooldownLabel:         "Bekleme Süresi (saniye)",
        cooldownDesc:          "Ses spam'ini önlemek için minimum bekleme. (0 = devre dışı)",
        exportBtn:             "💾  Yapılandırmayı Dışa Aktar",
        importBtn:             "📂  Yapılandırmayı İçe Aktar",
        importSuccess:         "✅  Yapılandırma başarıyla içe aktarıldı!",
        importError:           "⚠️  Geçersiz yapılandırma dosyası.",
        perUserTitle:          "🎵  Kişiye Özel Sesler",
        perUserDesc:           "Belirli kullanıcılar için farklı ses ayarla.",
        addUserBtn:            "➕  Kullanıcı Ekle",
        removeBtn:             "✕",
        userIdPlaceholder:     "Discord Kullanıcı ID",
        userLabelPlaceholder:  "Not (örn. Ahmet)",
        userUrlPlaceholder:    "Ses URL'si",
        uploadForUser:         "📁",
        testForUser:           "🔊",
        noUsers:               "Henüz kullanıcı eklenmedi.",
    }
};

// ══════════════════════════════════════════════════════════════
//  Yardımcı fonksiyonlar
// ══════════════════════════════════════════════════════════════
const isValidUrl = (url: string): boolean => {
    try {
        const u = new URL(url);
        return (u.protocol === "http:" || u.protocol === "https:") &&
            /\.(mp3|wav|ogg|aac|webm)$/i.test(u.pathname);
    } catch { return false; }
};

const getUserSounds = (): UserSound[] => {
    try { return JSON.parse(settings.store._userSounds || "[]"); }
    catch { return []; }
};

const saveUserSounds = (list: UserSound[]) => {
    settings.store._userSounds = JSON.stringify(list);
};

const safeBlobRevoke = (url: string | undefined) => {
    if (url?.startsWith("blob:")) {
        try { URL.revokeObjectURL(url); } catch {}
    }
};

// ── Dışa aktar: blob URL'leri temizle, JSON indir
const exportConfig = () => {
    const snapshot = {
        language:        settings.store.language,
        customSoundUrl:  settings.store.customSoundUrl?.startsWith("blob:") ? "" : (settings.store.customSoundUrl ?? ""),
        volume:          settings.store.volume,
        enabled:         settings.store.enabled,
        onlyMentions:    settings.store.onlyMentions,
        includeGroupDMs: settings.store.includeGroupDMs,
        cooldownSeconds: settings.store.cooldownSeconds,
        // Kullanıcı seslerinde de blob URL'leri temizle
        userSounds: getUserSounds().map(u => ({
            ...u,
            url:      u.url.startsWith("blob:") ? "" : u.url,
            fileName: u.url.startsWith("blob:") ? "" : u.fileName,
        })),
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "DnDNotifier-config.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
};

// ── İçe aktar: JSON dosyası yükle, store'u güncelle
const importConfig = (onSuccess: () => void, onError: () => void, forceUpdate: () => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string);

                // Temel alan varlık kontrolü
                if (typeof data !== "object" || data === null) throw new Error();

                if (typeof data.language        === "string")  settings.store.language        = data.language;
                if (typeof data.customSoundUrl  === "string")  settings.store.customSoundUrl  = data.customSoundUrl;
                if (typeof data.volume          === "number")  settings.store.volume          = data.volume;
                if (typeof data.enabled         === "boolean") settings.store.enabled         = data.enabled;
                if (typeof data.onlyMentions    === "boolean") settings.store.onlyMentions    = data.onlyMentions;
                if (typeof data.includeGroupDMs === "boolean") settings.store.includeGroupDMs = data.includeGroupDMs;
                if (typeof data.cooldownSeconds === "number")  settings.store.cooldownSeconds = data.cooldownSeconds;

                if (Array.isArray(data.userSounds)) {
                    const validated: UserSound[] = data.userSounds
                        .filter((u: any) => typeof u === "object" && u !== null)
                        .map((u: any) => ({
                            userId:   typeof u.userId   === "string" ? u.userId   : "",
                            label:    typeof u.label    === "string" ? u.label    : "",
                            url:      typeof u.url      === "string" ? u.url      : "",
                            fileName: typeof u.fileName === "string" ? u.fileName : "",
                        }));
                    saveUserSounds(validated);
                }

                // Dosya adını sıfırla (blob artık yok)
                settings.store._localFileName = "";

                forceUpdate();
                onSuccess();
            } catch {
                onError();
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

// ══════════════════════════════════════════════════════════════
//  Stil sabitleri
// ══════════════════════════════════════════════════════════════
const btnBase: React.CSSProperties = {
    background:    "rgba(255,255,255,0.08)",
    color:         "rgba(255,255,255,0.85)",
    border:        "1px solid rgba(255,255,255,0.15)",
    borderRadius:  "6px",
    padding:       "7px 14px",
    cursor:        "pointer",
    fontWeight:    "700",
    fontSize:      "13px",
    letterSpacing: "0.2px",
    transition:    "background 0.2s",
};

const btnReset: React.CSSProperties = {
    ...btnBase,
    background: "rgba(255,255,255,0.04)",
    color:      "rgba(255,255,255,0.45)",
    border:     "1px solid rgba(255,255,255,0.08)",
};

const btnDanger: React.CSSProperties = {
    ...btnBase,
    background: "rgba(255,60,60,0.15)",
    color:      "rgba(255,100,100,0.9)",
    border:     "1px solid rgba(255,60,60,0.2)",
    padding:    "5px 10px",
    fontSize:   "12px",
};

const btnSmall: React.CSSProperties = {
    ...btnBase,
    padding:  "5px 10px",
    fontSize: "12px",
};

const btnSuccess: React.CSSProperties = {
    ...btnBase,
    background: "rgba(59,165,93,0.18)",
    color:      "rgba(100,210,130,0.9)",
    border:     "1px solid rgba(59,165,93,0.25)",
};

const labelStyle: React.CSSProperties = {
    fontSize:      "11px",
    fontWeight:    "700",
    color:         "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
};

const inputStyle: React.CSSProperties = {
    width:        "100%",
    background:   "rgba(255,255,255,0.06)",
    border:       "1px solid rgba(255,255,255,0.12)",
    borderRadius: "6px",
    padding:      "7px 10px",
    color:        "rgba(255,255,255,0.85)",
    fontSize:     "13px",
    fontWeight:   "600",
    outline:      "none",
    boxSizing:    "border-box" as const,
};

const dividerStyle: React.CSSProperties = {
    borderTop: "1px solid rgba(255,255,255,0.07)",
    margin:    "4px 0",
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize:      "13px",
    fontWeight:    "800",
    color:         "rgba(255,255,255,0.7)",
    letterSpacing: "0.3px",
};

const toggleRowStyle: React.CSSProperties = {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    gap:            "12px",
};

const toggleLabelGroupStyle: React.CSSProperties = {
    display:       "flex",
    flexDirection: "column",
    gap:           "2px",
};

// ══════════════════════════════════════════════════════════════
//  Toggle Bileşeni
// ══════════════════════════════════════════════════════════════
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    const trackStyle: React.CSSProperties = {
        width:         "36px",
        height:        "20px",
        borderRadius:  "10px",
        background:    value ? "rgba(88,101,242,0.85)" : "rgba(255,255,255,0.12)",
        border:        "1px solid " + (value ? "rgba(88,101,242,1)" : "rgba(255,255,255,0.18)"),
        position:      "relative",
        cursor:        "pointer",
        flexShrink:    0,
        transition:    "background 0.2s, border-color 0.2s",
    };
    const thumbStyle: React.CSSProperties = {
        position:     "absolute",
        top:          "2px",
        left:         value ? "17px" : "2px",
        width:        "14px",
        height:       "14px",
        borderRadius: "50%",
        background:   "rgba(255,255,255,0.95)",
        transition:   "left 0.2s",
    };
    return React.createElement(
        "div",
        { style: trackStyle, onClick: () => onChange(!value), role: "switch", "aria-checked": value },
        React.createElement("div", { style: thumbStyle })
    );
}

// ══════════════════════════════════════════════════════════════
//  Ayarlar Paneli
// ══════════════════════════════════════════════════════════════
const settings = definePluginSettings({
    mainPanel: {
        type:        OptionType.COMPONENT,
        description: "",
        component:   () => {
            const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
            const [statusMsg, setStatusMsg] = React.useState<string>("");

            const lang          = (settings.store.language ?? "en") as "en" | "tr";
            const t             = i18n[lang];
            const url           = settings.store.customSoundUrl ?? "";
            const fileName      = settings.store._localFileName ?? "";
            const volume        = settings.store.volume ?? 100;
            const enabled       = settings.store.enabled ?? true;
            const onlyMentions  = settings.store.onlyMentions ?? false;
            const includeGroups = settings.store.includeGroupDMs ?? false;
            const cooldown      = settings.store.cooldownSeconds ?? 3;
            const userSounds    = getUserSounds();

            const showInvalidWarning =
                url !== "" && !url.startsWith("blob:") && !isValidUrl(url);

            // Durum mesajını göster ve 3sn sonra temizle
            const showStatus = (msg: string) => {
                setStatusMsg(msg);
                setTimeout(() => setStatusMsg(""), 3000);
            };

            // Dosya yükle (varsayılan)
            const handleUploadDefault = () => {
                const input    = document.createElement("input");
                input.type     = "file";
                input.accept   = "audio/*";
                input.onchange = () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    safeBlobRevoke(settings.store.customSoundUrl);
                    settings.store.customSoundUrl = URL.createObjectURL(file);
                    settings.store._localFileName = file.name;
                    forceUpdate();
                };
                input.click();
            };

            // Dosya yükle (kullanıcı başına)
            const handleUploadForUser = (index: number) => {
                const input    = document.createElement("input");
                input.type     = "file";
                input.accept   = "audio/*";
                input.onchange = () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    const list = getUserSounds();
                    safeBlobRevoke(list[index]?.url);
                    list[index].url      = URL.createObjectURL(file);
                    list[index].fileName = file.name;
                    saveUserSounds(list);
                    forceUpdate();
                };
                input.click();
            };

            // Ses çal
            const playSound = (soundUrl: string) => {
                if (!soundUrl?.trim()) return;
                const a = new Audio(soundUrl);
                a.volume = Math.min(1, Math.max(0, volume / 100));
                a.play().catch((e: Error) =>
                    console.error("[DnDNotifier] Test sound failed:", e)
                );
            };

            return React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: "16px" } },

                // ── Dil seçimi
                React.createElement(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                    React.createElement("span", { style: labelStyle }, t.langLabel),
                    React.createElement(
                        "div",
                        { style: { display: "flex", gap: "6px" } },
                        ...["en", "tr"].map(code =>
                            React.createElement(
                                "button",
                                {
                                    key:     code,
                                    style:   {
                                        ...btnBase,
                                        flex:       1,
                                        background: lang === code ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)",
                                        border:     lang === code ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                                        color:      lang === code ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                                    },
                                    onClick: () => { settings.store.language = code; forceUpdate(); }
                                },
                                code === "en" ? "🇬🇧  English" : "🇹🇷  Türkçe"
                            )
                        )
                    )
                ),

                React.createElement("div", { style: dividerStyle }),

                // ════════════════════════════
                // ── Davranış Ayarları
                // ════════════════════════════
                React.createElement("span", { style: sectionTitleStyle }, t.sectionBehavior),

                // Aç/kapat toggle
                React.createElement(
                    "div",
                    { style: toggleRowStyle },
                    React.createElement(
                        "div",
                        { style: toggleLabelGroupStyle },
                        React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "rgba(255,255,255,0.75)" } }, t.enabledLabel),
                        React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: "600" } }, t.enabledDesc)
                    ),
                    React.createElement(Toggle, {
                        value:    enabled,
                        onChange: (v) => { settings.store.enabled = v; forceUpdate(); }
                    })
                ),

                // Yalnızca @mention
                React.createElement(
                    "div",
                    { style: toggleRowStyle },
                    React.createElement(
                        "div",
                        { style: toggleLabelGroupStyle },
                        React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "rgba(255,255,255,0.75)" } }, t.onlyMentionsLabel),
                        React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: "600" } }, t.onlyMentionsDesc)
                    ),
                    React.createElement(Toggle, {
                        value:    onlyMentions,
                        onChange: (v) => { settings.store.onlyMentions = v; forceUpdate(); }
                    })
                ),

                // Grup DM'leri dahil et
                React.createElement(
                    "div",
                    { style: toggleRowStyle },
                    React.createElement(
                        "div",
                        { style: toggleLabelGroupStyle },
                        React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "rgba(255,255,255,0.75)" } }, t.groupDMsLabel),
                        React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: "600" } }, t.groupDMsDesc)
                    ),
                    React.createElement(Toggle, {
                        value:    includeGroups,
                        onChange: (v) => { settings.store.includeGroupDMs = v; forceUpdate(); }
                    })
                ),

                // Cooldown
                React.createElement(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                    React.createElement(
                        "div",
                        { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
                        React.createElement("span", { style: labelStyle }, t.cooldownLabel),
                        React.createElement(
                            "span",
                            { style: { fontSize: "13px", fontWeight: "700", color: "rgba(255,255,255,0.6)" } },
                            cooldown + "s"
                        )
                    ),
                    React.createElement("span", { style: { fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: "600" } }, t.cooldownDesc),
                    React.createElement("input", {
                        type:     "range",
                        min:      0,
                        max:      30,
                        step:     1,
                        value:    cooldown,
                        style:    { width: "100%", accentColor: "rgba(255,255,255,0.5)", cursor: "pointer" },
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            settings.store.cooldownSeconds = Number(e.target.value);
                            forceUpdate();
                        }
                    })
                ),

                // ════════════════════════════
                // ── Dışa / İçe Aktar
                // ════════════════════════════
                React.createElement(
                    "div",
                    { style: { display: "flex", gap: "8px", flexWrap: "wrap" as const } },
                    React.createElement(
                        "button",
                        { style: { ...btnBase, flex: 1 }, onClick: exportConfig },
                        t.exportBtn
                    ),
                    React.createElement(
                        "button",
                        {
                            style:   { ...btnSuccess, flex: 1 },
                            onClick: () => importConfig(
                                () => showStatus(t.importSuccess),
                                () => showStatus(t.importError),
                                forceUpdate
                            )
                        },
                        t.importBtn
                    )
                ),

                // Durum mesajı (başarı / hata)
                statusMsg !== "" && React.createElement(
                    "span",
                    {
                        style: {
                            fontSize:   "12px",
                            fontWeight: "700",
                            color:      statusMsg.startsWith("✅")
                                ? "rgba(100,210,130,0.9)"
                                : "var(--status-danger)",
                        }
                    },
                    statusMsg
                ),

                React.createElement("div", { style: dividerStyle }),

                // ════════════════════════════
                // ── Varsayılan Ses
                // ════════════════════════════
                React.createElement("span", { style: sectionTitleStyle }, t.sectionDefault),

                React.createElement(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                    React.createElement("span", { style: labelStyle }, t.urlLabel),
                    React.createElement("span", { style: { fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: "600" } }, t.urlDesc),
                    React.createElement("input", {
                        type:        "text",
                        placeholder: t.urlPlaceholder,
                        value:       url.startsWith("blob:") ? "" : url,
                        style:       inputStyle,
                        onChange:    (e: React.ChangeEvent<HTMLInputElement>) => {
                            safeBlobRevoke(settings.store.customSoundUrl);
                            settings.store.customSoundUrl = e.target.value;
                            settings.store._localFileName = "";
                            forceUpdate();
                        }
                    }),
                    showInvalidWarning && React.createElement(
                        "span",
                        { style: { fontSize: "12px", color: "var(--status-danger)", fontWeight: "700" } },
                        t.invalidUrl
                    )
                ),

                React.createElement(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                    React.createElement("button", { style: btnBase, onClick: handleUploadDefault }, t.uploadBtn),
                    fileName !== "" && React.createElement(
                        "span",
                        { style: { fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: "600" } },
                        t.fileLoaded + fileName
                    )
                ),

                React.createElement(
                    "div",
                    { style: { display: "flex", gap: "8px", flexWrap: "wrap" as const } },
                    React.createElement("button", {
                        style:   btnBase,
                        onClick: () => playSound(settings.store.customSoundUrl?.trim())
                    }, t.testBtn),
                    React.createElement("button", {
                        style:   btnReset,
                        onClick: () => {
                            safeBlobRevoke(settings.store.customSoundUrl);
                            settings.store.customSoundUrl = defaultSound;
                            settings.store._localFileName = "";
                            settings.store.volume         = 100;
                            audio.pause();
                            audio.src       = "";
                            currentSoundUrl = "";
                            lastPlayedAt    = 0;
                            forceUpdate();
                        }
                    }, t.resetBtn)
                ),

                React.createElement("div", { style: dividerStyle }),

                // ════════════════════════════
                // ── Ses Seviyesi
                // ════════════════════════════
                React.createElement("span", { style: sectionTitleStyle }, t.sectionVolume),
                React.createElement(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: "6px" } },
                    React.createElement(
                        "span",
                        { style: { fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: "700" } },
                        volume + "%"
                    ),
                    React.createElement("input", {
                        type:     "range",
                        min:      0,
                        max:      100,
                        step:     1,
                        value:    volume,
                        style:    { width: "100%", accentColor: "rgba(255,255,255,0.5)", cursor: "pointer" },
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            settings.store.volume = Number(e.target.value);
                            forceUpdate();
                        }
                    })
                ),

                React.createElement("div", { style: dividerStyle }),

                // ════════════════════════════
                // ── Kişiye Özel Sesler
                // ════════════════════════════
                React.createElement("span", { style: sectionTitleStyle }, t.perUserTitle),
                React.createElement(
                    "span",
                    { style: { fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: "600" } },
                    t.perUserDesc
                ),

                ...userSounds.map((entry, index) => {
                    const perUserInvalid =
                        entry.url !== "" && !entry.url.startsWith("blob:") && !isValidUrl(entry.url);

                    return React.createElement(
                        "div",
                        {
                            key:   index,
                            style: {
                                background:    "rgba(255,255,255,0.04)",
                                border:        "1px solid rgba(255,255,255,0.09)",
                                borderRadius:  "8px",
                                padding:       "12px",
                                display:       "flex",
                                flexDirection: "column" as const,
                                gap:           "8px",
                            }
                        },

                        React.createElement(
                            "div",
                            { style: { display: "flex", gap: "6px", alignItems: "center" } },
                            React.createElement("input", {
                                type:        "text",
                                placeholder: t.userLabelPlaceholder,
                                value:       entry.label,
                                style:       { ...inputStyle, flex: 1 },
                                onChange:    (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const list = getUserSounds();
                                    list[index].label = e.target.value;
                                    saveUserSounds(list);
                                    forceUpdate();
                                }
                            }),
                            React.createElement("input", {
                                type:        "text",
                                placeholder: t.userIdPlaceholder,
                                value:       entry.userId,
                                style:       { ...inputStyle, flex: 1 },
                                onChange:    (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const list = getUserSounds();
                                    list[index].userId = e.target.value.trim();
                                    saveUserSounds(list);
                                    forceUpdate();
                                }
                            }),
                            React.createElement(
                                "button",
                                {
                                    style:   btnDanger,
                                    onClick: () => {
                                        const list = getUserSounds();
                                        safeBlobRevoke(list[index]?.url);
                                        list.splice(index, 1);
                                        saveUserSounds(list);
                                        forceUpdate();
                                    }
                                },
                                t.removeBtn
                            )
                        ),

                        React.createElement(
                            "div",
                            { style: { display: "flex", gap: "6px", alignItems: "center" } },
                            React.createElement("input", {
                                type:        "text",
                                placeholder: t.userUrlPlaceholder,
                                value:       entry.url.startsWith("blob:") ? "" : entry.url,
                                style:       { ...inputStyle, flex: 1 },
                                onChange:    (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const list = getUserSounds();
                                    safeBlobRevoke(list[index]?.url);
                                    list[index].url      = e.target.value;
                                    list[index].fileName = "";
                                    saveUserSounds(list);
                                    forceUpdate();
                                }
                            }),
                            React.createElement(
                                "button",
                                { style: btnSmall, onClick: () => handleUploadForUser(index) },
                                t.uploadForUser
                            ),
                            React.createElement(
                                "button",
                                { style: btnSmall, onClick: () => playSound(entry.url) },
                                t.testForUser
                            )
                        ),

                        perUserInvalid && React.createElement(
                            "span",
                            { style: { fontSize: "12px", color: "var(--status-danger)", fontWeight: "700" } },
                            t.invalidUrl
                        ),

                        entry.fileName !== "" && React.createElement(
                            "span",
                            { style: { fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: "600" } },
                            t.fileLoaded + entry.fileName
                        )
                    );
                }),

                userSounds.length === 0 && React.createElement(
                    "span",
                    { style: { fontSize: "12px", color: "rgba(255,255,255,0.25)", fontWeight: "600" } },
                    t.noUsers
                ),

                React.createElement(
                    "button",
                    {
                        style:   btnBase,
                        onClick: () => {
                            const list = getUserSounds();
                            list.push({ userId: "", label: "", url: "", fileName: "" });
                            saveUserSounds(list);
                            forceUpdate();
                        }
                    },
                    t.addUserBtn
                )
            );
        }
    },

    // ── Gizli store alanları
    language:        { type: OptionType.STRING,  default: "en",  description: "", hidden: true },
    customSoundUrl:  { type: OptionType.STRING,  default: "",    description: "", hidden: true },
    volume:          { type: OptionType.NUMBER,  default: 100,   description: "", hidden: true },
    _localFileName:  { type: OptionType.STRING,  default: "",    description: "", hidden: true },
    _userSounds:     { type: OptionType.STRING,  default: "[]",  description: "", hidden: true },
    enabled:         { type: OptionType.BOOLEAN, default: true,  description: "", hidden: true },
    onlyMentions:    { type: OptionType.BOOLEAN, default: false, description: "", hidden: true },
    includeGroupDMs: { type: OptionType.BOOLEAN, default: false, description: "", hidden: true },
    cooldownSeconds: { type: OptionType.NUMBER,  default: 3,     description: "", hidden: true },
});

// ══════════════════════════════════════════════════════════════
//  Plugin tanımı
// ══════════════════════════════════════════════════════════════
export default definePlugin({
    name:        "DnDNotifier",
    description: "Plays a custom notification sound for DMs while in DND mode.",
    authors:     [{ name: "Caney", id: 123456789n }],
    settings,

    flux: {
        MESSAGE_CREATE(data: any) {
            if (!UserStore || !PresenceStore) return;

            if (!(settings.store.enabled ?? true)) return;

            const currentUser = UserStore.getCurrentUser();
            if (!currentUser) return;

            const message = data.message;

            if (message.author?.id === currentUser.id) return;
            if (message.guild_id) return;

            const channelId   = message.channel_id;
            const channel     = ChannelStore?.getChannel?.(channelId);
            const channelType = channel?.type;

            const isDM    = channelType === CHANNEL_TYPE_DM;
            const isGroup = channelType === CHANNEL_TYPE_GROUP;

            if (!isDM && !(isGroup && (settings.store.includeGroupDMs ?? false))) return;

            const status = PresenceStore.getStatus(currentUser.id);
            if (status !== "dnd") return;

            if (settings.store.onlyMentions ?? false) {
                const mentions: any[] = message.mentions ?? [];
                const mentioned = mentions.some((m: any) => m.id === currentUser.id);
                if (!mentioned) return;
            }

            const cooldownMs = (settings.store.cooldownSeconds ?? 3) * 1000;
            const now        = Date.now();
            if (cooldownMs > 0 && now - lastPlayedAt < cooldownMs) return;
            lastPlayedAt = now;

            const userSounds = getUserSounds();
            const authorId   = message.author?.id ?? "";
            const perUser    = userSounds.find(u => u.userId === authorId && u.url?.trim());
            const defaultUrl = settings.store.customSoundUrl?.trim();
            const soundUrl   = perUser?.url?.trim() || defaultUrl || defaultSound;

            if (!soundUrl) return;

            try {
                if (currentSoundUrl !== soundUrl) {
                    audio.src       = soundUrl;
                    audio.load();
                    currentSoundUrl = soundUrl;
                }
                audio.volume      = Math.min(1, Math.max(0, (settings.store.volume ?? 100) / 100));
                audio.currentTime = 0;
                audio.play().catch((e: Error) =>
                    console.error("[DnDNotifier] Failed to play sound:", e)
                );
            } catch (e) {
                console.error("[DnDNotifier] Error:", e);
            }
        }
    },

    start() {
        UserStore     = findByProps("getCurrentUser", "getUser");
        PresenceStore = findByProps("getStatus", "getActivities");
        ChannelStore  = findByProps("getChannel", "getDMFromUserId");
    },

    stop() {
        audio.pause();
        audio.src       = "";
        currentSoundUrl = "";
        lastPlayedAt    = 0;
    }
});
