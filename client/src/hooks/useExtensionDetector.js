import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Known browser extension probing signatures, DOM tags, and global properties.
 */
const KNOWN_EXTENSION_SELECTORS = [
  // Grammarly
  { name: 'Grammarly Extension', category: 'Grammar / In-page AI', selector: 'grammarly-desktop-integration, grammarly-extension, [data-grammarly-shadow-root], [data-grammarly-provider], grammarly-popups, g-ext-wrapper' },
  // AI Assistants & Sidebar extensions
  { name: 'Monica AI / Copilot', category: 'AI Assistant', selector: '#monica-content-root, [class*="monica-"], div#monica-quick-action, div#monica-root' },
  { name: 'Sider AI / ChatGPT Sidebar', category: 'AI Assistant', selector: '#__sider__, [id*="sider-"], [class*="sider-"], div#__sider_root__' },
  { name: 'Harpa AI Automation', category: 'Automation / AI', selector: '[data-harpa], [id*="harpa"], [class*="harpa-"], div#harpa-root' },
  { name: 'Merlin AI', category: 'AI Assistant', selector: '#merlin-companion, [id*="merlin-"], div#merlin-root' },
  { name: 'ChatGPT Sidebar / MaxAI', category: 'AI Assistant', selector: '#chatgpt-sidebar, #maxai-root, [id*="chatgpt-ext"], div#chatgpt-ext-root' },
  { name: 'Blackbox AI Code Assistant', category: 'Code Helper', selector: '#blackbox-ext, [id*="blackbox"], div#blackbox-search-box' },
  { name: 'Liner AI / Highlighter', category: 'AI Assistant', selector: '[id*="liner-"], [class*="liner-"], div#liner-tooltip' },
  { name: 'SciSpace / Research AI', category: 'AI Assistant', selector: '[id*="scispace-"], div#scispace-sidebar' },
  { name: 'Copyfish OCR / Text Grabber', category: 'OCR / Screen Grabber', selector: '[id*="copyfish-"], div#copyfish_content' },
  // Script Runners & Automation (Tampermonkey, Violentmonkey, Greasemonkey)
  { name: 'Tampermonkey / Userscript Runner', category: 'Script Injector', selector: '[id*="tampermonkey"], [id*="violentmonkey"], [id*="userscript"], [data-v-userscript], div.userscript-dialog' },
  // Password Managers / Autofill / Injected Overlays
  { name: 'LastPass Autofill', category: 'Form Injector', selector: '[data-lastpass-root], [data-lastpass-icon-root], div[id*="lastpass"]' },
  { name: 'Dashlane Autofill', category: 'Form Injector', selector: '[data-dashlane-root], [data-dashlane-injected], div[id*="dashlane"]' },
  { name: '1Password Autofill', category: 'Form Injector', selector: '[data-1password-root], div#onepassword-injected, [data-onepassword-root]' },
  { name: 'Bitwarden Autofill', category: 'Form Injector', selector: '[data-bitwarden-watching], div#bitwarden-root, [data-bw-element]' },
  { name: 'NordPass Autofill', category: 'Form Injector', selector: '[data-nordpass-root], [data-nordpass-icon]' },
  { name: 'Keeper Autofill', category: 'Form Injector', selector: '[data-keeper-root], [data-keeper-icon]' },
  // Theme / Dark Mode / Style Manipulators
  { name: 'Dark Reader / Custom Styler', category: 'DOM Styler', selector: 'style.darkreader, style[class*="darkreader"], meta[name="darkreader"], style[id*="dark-reader"]' },
  { name: 'Night Eye / Dark Mode', category: 'DOM Styler', selector: '[id*="night-eye"], style[id*="nighteye"]' },
  // Adblockers / Content Modifiers
  { name: 'AdGuard / Content Filter', category: 'Content Modifier', selector: 'style[id*="adguard"], div[id*="adguard-"]' },
  { name: 'uBlock / AdBlock Overlay', category: 'Content Modifier', selector: 'div[id*="ublock-overlay"], [id*="abp-modal"]' },
  // Translation Extensions
  { name: 'DeepL Inline Translator', category: 'Translator', selector: '#deepl-inline-translate, .deepl-inline-translate-btn, [data-deepl-inline]' },
  { name: 'Google Translate Inline', category: 'Translator', selector: '[id*="goog-gt-tt"], .goog-te-banner-frame' },
  // Devtools / Debugging Extensions
  { name: 'React DevTools / DOM Hook', category: 'Developer Tool', selector: 'div#__reactDevTools, [data-reactroot-devtools]' }
];

const KNOWN_GLOBAL_PROPERTIES = [
  { name: 'MetaMask / Web3 Wallet', category: 'Crypto / Wallet', key: 'ethereum' },
  { name: 'Solana / Phantom Wallet', category: 'Crypto / Wallet', key: 'solana' },
  { name: 'React Developer Tools Extension', category: 'Developer Tool', key: '__REACT_DEVTOOLS_GLOBAL_HOOK__' },
  { name: 'Tampermonkey / Greasemonkey API', category: 'Script Injector', key: 'GM' },
  { name: 'Tampermonkey / GM_setValue', category: 'Script Injector', key: 'GM_setValue' },
  { name: 'Grammarly Injected Global', category: 'Grammar / In-page AI', key: '__grammarly' },
  { name: 'Monica AI Injected Global', category: 'AI Assistant', key: '_monica_root' },
  { name: 'Harpa AI Injected Global', category: 'Automation / AI', key: '__HARPA_AI__' },
  { name: 'Sider AI Injected Global', category: 'AI Assistant', key: '__SIDER_CONFIG__' },
  { name: 'Merlin AI Injected Global', category: 'AI Assistant', key: '__MERLIN__' },
  { name: 'DarkReader Active Engine', category: 'DOM Styler', key: 'DarkReader' }
];

/**
 * Web Accessible Resource probes for popular extension IDs
 */
const WAR_PROBES = [
  { id: 'fmkadmapgofadopljbjfkapdkoienihi', path: 'icons/128.png', name: 'React Developer Tools' },
  { id: 'kbfnbcaeplbcioakkpcpgfkobkghlhen', path: 'src/images/logo.svg', name: 'Grammarly Chrome Extension' },
  { id: 'eimadpbcbfnmbkopoojfekhnkhdbieeh', path: 'popup/index.html', name: 'Dark Reader Extension' },
  { id: 'dhdgffkkebhmkfjojejmpbldmpobfkfo', path: 'images/icon128.png', name: 'Tampermonkey Script Manager' },
  { id: 'cjpalhdlnbpafiamejdnhcphjbkeiagm', path: 'web_accessible_resources/noop.html', name: 'uBlock Origin Extension' },
  { id: 'ofpnmcalabcbjgholdjcjblkibolbppb', path: 'icons/icon-128.png', name: 'Monica AI Extension' }
];

export function useExtensionDetector() {
  const [detectedExtensions, setDetectedExtensions] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [lastScanTime, setLastScanTime] = useState(Date.now());
  const [scanCount, setScanCount] = useState(0);
  const isMounted = useRef(true);

  const scanForExtensions = useCallback(async () => {
    setIsScanning(true);
    const findings = [];
    const seenNames = new Set();

    const addFinding = (item) => {
      if (!seenNames.has(item.name)) {
        seenNames.add(item.name);
        findings.push(item);
      }
    };

    // 1. DOM Element & Selector Check
    for (const item of KNOWN_EXTENSION_SELECTORS) {
      try {
        const found = document.querySelector(item.selector);
        if (found) {
          addFinding({
            name: item.name,
            category: item.category,
            source: 'DOM Injection Found',
            details: `Injected element <${found.tagName.toLowerCase()}> detected in active page.`
          });
        }
      } catch {
        // Ignore invalid selector errors
      }
    }

    // 2. Scan for Injected Chrome / Browser Extension Resource URLs
    try {
      const injectedElements = document.querySelectorAll('script, link, iframe, embed, object, img, style');
      injectedElements.forEach((el) => {
        const src = el.src || el.href || '';
        if (
          src.startsWith('chrome-extension://') ||
          src.startsWith('moz-extension://') ||
          src.startsWith('safari-extension://') ||
          src.startsWith('edge-extension://') ||
          src.startsWith('extension://')
        ) {
          addFinding({
            name: 'Injected Third-Party Extension Resource',
            category: 'External Script / Style Injection',
            source: 'Protocol Inspection',
            details: `Resource URL: ${src.substring(0, 45)}...`
          });
        }
      });
    } catch {
      // Ignore querySelector exceptions
    }

    // 3. Scan for Custom Extension Custom Elements / Attributes on Body or HTML
    try {
      const rootAttrs = [...document.documentElement.attributes, ...(document.body ? document.body.attributes : [])];
      rootAttrs.forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (
          name.includes('grammarly') ||
          name.includes('monica') ||
          name.includes('sider') ||
          name.includes('extension') ||
          name.includes('lastpass') ||
          name.includes('dashlane') ||
          name.includes('darkreader')
        ) {
          addFinding({
            name: `Browser Extension Attribute (${name})`,
            category: 'DOM Attribute Modification',
            source: 'Root Attribute Inspection',
            details: `Injected attribute "${attr.name}" on document root.`
          });
        }
      });
    } catch {
      // Ignore
    }

    // 4. Global Window Object & Prototype Check
    for (const item of KNOWN_GLOBAL_PROPERTIES) {
      try {
        if (typeof window !== 'undefined' && window[item.key] !== undefined) {
          addFinding({
            name: item.name,
            category: item.category,
            source: 'Global Variable Exposed',
            details: `Injected global "window.${item.key}" detected.`
          });
        }
      } catch {
        // Ignore
      }
    }

    // 5. Active Web Accessible Resource (WAR) Probe (Async with timeout)
    const warPromises = WAR_PROBES.map(async (probe) => {
      return new Promise((resolve) => {
        const url = `chrome-extension://${probe.id}/${probe.path}`;
        const img = new Image();
        let finished = false;

        const timeoutId = setTimeout(() => {
          if (!finished) {
            finished = true;
            img.src = '';
            resolve(null);
          }
        }, 300);

        img.onload = () => {
          if (!finished) {
            finished = true;
            clearTimeout(timeoutId);
            resolve({
              name: probe.name,
              category: 'Installed Browser Extension',
              source: 'Resource Probe Match',
              details: `Extension ID: ${probe.id.substring(0, 10)}... active.`
            });
          }
        };

        img.onerror = () => {
          if (!finished) {
            finished = true;
            clearTimeout(timeoutId);
            resolve(null);
          }
        };

        img.src = url;
      });
    });

    try {
      const warResults = await Promise.all(warPromises);
      warResults.forEach((result) => {
        if (result) {
          addFinding(result);
        }
      });
    } catch {
      // Ignore network errors
    }

    if (isMounted.current) {
      setDetectedExtensions(findings);
      setIsScanning(false);
      setLastScanTime(Date.now());
      setScanCount((prev) => prev + 1);
    }
  }, []);

  // Set up live continuous monitoring with MutationObserver + Polling Interval
  useEffect(() => {
    isMounted.current = true;
    scanForExtensions();

    // DOM Mutation Observer for real-time detection of injected scripts/elements
    let observer = null;
    try {
      observer = new MutationObserver(() => {
        scanForExtensions();
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'data-grammarly-shadow-root', 'data-lastpass-root', 'data-dashlane-root']
      });
    } catch {
      // MutationObserver fallback
    }

    // Periodic sweep every 2 seconds to detect when user disables/uninstalls extensions
    const intervalId = setInterval(() => {
      scanForExtensions();
    }, 2000);

    return () => {
      isMounted.current = false;
      if (observer) {
        observer.disconnect();
      }
      clearInterval(intervalId);
    };
  }, [scanForExtensions]);

  return {
    hasExtensions: detectedExtensions.length > 0,
    detectedExtensions,
    isScanning,
    lastScanTime,
    scanCount,
    rescan: scanForExtensions
  };
}
