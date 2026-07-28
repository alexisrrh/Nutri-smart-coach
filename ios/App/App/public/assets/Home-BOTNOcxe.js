import{r as e}from"./chunk-QTnfLwEv.js";import{a as t,n,r}from"./createLucideIcon-Chn_xuvs.js";import{i,n as a}from"./utensils-Bj7u6rWX.js";import{t as o}from"./arrow-right-TWc-_Kc1.js";import{n as s,t as c}from"./NavNavigation-B4otHsgq.js";import{yt as l}from"./index-DJpvD85R.js";import{t as u}from"./SmartImage-CFIQT3TK.js";import{prefetchDashboardData as d,preloadDashboardChunk as f}from"./dashboardPrefetchService-DATkb008.js";var p=e(t(),1),m=n();function h(){let{user:e,loadingAuth:t}=l(),{t:n}=r();return(0,p.useEffect)(()=>{if(t||!e?.id)return;let n=()=>{f(),d(e.id)};if(`requestIdleCallback`in window){let e=window.requestIdleCallback(n,{timeout:1800});return()=>window.cancelIdleCallback?.(e)}let r=window.setTimeout(n,900);return()=>window.clearTimeout(r)},[t,e?.id]),(0,m.jsxs)(`div`,{className:`home-home-shell h-dvh w-full bg-[var(--app-bg)] flex items-start justify-center overflow-hidden font-sans`,children:[(0,m.jsx)(`style`,{children:`
        @keyframes laserMotion {
            0%, 100% { top: 0%; opacity: 1; }
            50% { top: 100%; opacity: 1; }
        }
        @keyframes radarPulse {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.15; }
            100% { transform: scale(0.95); opacity: 0.5; }
        }
        .laser-line {
            animation: laserMotion 3s ease-in-out infinite;
        }
        .radar-glow {
            animation: radarPulse 4s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 390px) {
          .home-header {
            gap: 0.4rem;
          }
          .home-header-brand {
            gap: 0.4rem;
          }
          .home-header-brand img {
            width: 34px;
            height: 34px;
          }
          .home-header-brand p:first-child {
            font-size: 0.78rem;
            line-height: 1;
          }
          .home-header-brand p:last-child {
            font-size: 7px;
            letter-spacing: 0.14em;
          }
          .home-header-auth {
            gap: 0.35rem;
          }
          .home-header-auth-btn {
            padding-left: 0.45rem;
            padding-right: 0.45rem;
            padding-top: 0.35rem;
            padding-bottom: 0.35rem;
            font-size: 8px;
            letter-spacing: 0.12em;
            line-height: 1;
            white-space: nowrap;
          }
          .home-header-auth-primary {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }
        @media (max-width: 430px) and (max-height: 900px) and (pointer: coarse) {
          .home-home-shell .home-home-nav-wrap {
            padding-bottom: calc(env(safe-area-inset-bottom) + 14px);
            height: 78px;
            margin-top: 0.15rem;
          }
          .home-home-shell .home-home-nav-floating {
            bottom: calc(env(safe-area-inset-bottom) + 16px);
            left: 0.9rem;
            right: 0.9rem;
          }
        }
        @media (max-height: 800px) {
          .home-home-shell > main {
            padding-top: calc(env(safe-area-inset-top) + 12px);
          }
          .home-home-shell .home-home-header {
            padding-top: 6px;
          }
          .home-home-shell .home-home-nav {
            padding-bottom: 6px;
          }
          .home-home-shell .home-home-title {
            font-size: 1.42rem;
          }
          .home-home-shell .home-home-badge {
            margin-bottom: 0.5rem;
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
            font-size: 7px;
          }
          .home-home-shell .home-home-content {
            gap: 0.35rem;
            padding-top: 0.55rem;
            padding-bottom: 0.1rem;
          }
          .home-home-shell .home-home-panel-wrap {
            padding-left: 0;
            padding-right: 0;
          }
          .home-home-shell .home-home-panel {
            padding: 0.35rem;
          }
          .home-home-shell .home-home-panel-inner {
            padding: 0.5rem;
          }
          .home-home-shell .home-home-panel-header {
            margin-bottom: 0.35rem;
          }
          .home-home-shell .home-home-panel-title {
            font-size: 12px;
          }
          .home-home-shell .home-home-camera-btn {
            width: 1.75rem;
            height: 1.75rem;
          }
          .home-home-shell .home-home-preview {
            height: 7.5rem;
          }
          .home-home-shell .home-home-macros {
            margin-top: 0.45rem;
            gap: 0.35rem;
          }
          .home-home-shell .home-home-stats-grid {
            gap: 0.35rem;
            padding-bottom: 0.25rem;
          }
          .home-home-shell .home-home-stat {
            padding: 0.35rem;
          }
          .home-home-shell .home-home-privacy {
            margin-top: 0.15rem;
          }
          .home-home-shell .home-home-cta-wrap {
            padding-top: 0.25rem;
            padding-bottom: 0.85rem;
          }
          .home-home-shell .home-home-cta {
            padding-top: 0.7rem;
            padding-bottom: 0.7rem;
          }
          .home-home-shell .home-home-nav-wrap {
            margin-top: 0.5rem;
            height: 60px;
          }
        }
        @media (max-height: 700px) {
          .home-home-shell .home-home-title {
            font-size: 1.28rem;
          }
          .home-home-shell .home-home-badge {
            margin-bottom: 0.35rem;
            padding-top: 0.2rem;
            padding-bottom: 0.2rem;
          }
          .home-home-shell .home-home-content {
            gap: 0.25rem;
            padding-top: 0.4rem;
          }
          .home-home-shell .home-home-panel {
            padding: 0.28rem;
          }
          .home-home-shell .home-home-panel-inner {
            padding: 0.4rem;
          }
          .home-home-shell .home-home-panel-header {
            margin-bottom: 0.25rem;
          }
          .home-home-shell .home-home-preview {
            height: 6.9rem;
          }
          .home-home-shell .home-home-macros {
            margin-top: 0.35rem;
          }
          .home-home-shell .home-home-stats-grid {
            padding-bottom: 0.15rem;
          }
          .home-home-shell .home-home-nav-wrap {
            margin-top: 0.65rem;
            height: 54px;
          }
        }
      `}),(0,m.jsxs)(`main`,{className:`relative w-full max-w-[430px] h-full md:h-[880px] bg-[var(--app-card)] text-[var(--app-text)] md:rounded-[40px] shadow-2xl md:border-8 md:border-[var(--app-border)] flex flex-col overflow-hidden`,style:{paddingTop:`calc(env(safe-area-inset-top) + 16px)`},children:[(0,m.jsx)(`div`,{className:`absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,var(--app-primary)15,transparent_45%)] pointer-events-none opacity-40`}),(0,m.jsx)(`div`,{className:`absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20`}),(0,m.jsx)(`header`,{className:`home-progress-header relative z-20 px-5 pt-4 shrink-0`,children:(0,m.jsxs)(`nav`,{className:`home-progress-nav flex items-center justify-between border-b border-[var(--app-border)] pb-3.5`,children:[(0,m.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,m.jsx)(`img`,{src:`/favicon.png`,alt:n(`home.brandAlt`),className:`h-10 w-10 rounded-xl object-cover bg-transparent p-0.5 shadow-[0_0_20px_var(--app-glow)] border border-[var(--app-border)]`}),(0,m.jsxs)(`div`,{className:`leading-none`,children:[(0,m.jsxs)(`p`,{className:`text-sm font-black italic tracking-tight text-[var(--app-text)]`,children:[n(`home.brandPrefix`),(0,m.jsx)(`span`,{className:`text-[var(--app-primary)]`,children:n(`home.brandSuffix`)})]}),(0,m.jsx)(`p`,{className:`mt-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)]`,children:n(`home.headerTagline`)})]})]}),(0,m.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,m.jsx)(i,{to:`/login`,className:`rounded-full border border-[var(--app-border)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-muted)]`,children:n(`home.header.login`)}),(0,m.jsx)(i,{to:`/registro`,className:`rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[var(--app-surface)]`,children:n(`home.header.register`)})]})]})}),(0,m.jsx)(`section`,{className:`relative z-10 flex-1 px-5 overflow-y-auto scrollbar-hide`,children:(0,m.jsxs)(`div`,{className:`home-home-content flex flex-col gap-4 pt-3 pb-4`,children:[(0,m.jsxs)(`div`,{className:`flex flex-col items-center text-center shrink-0`,children:[(0,m.jsxs)(`div`,{className:`home-home-badge mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-1 text-[9px] font-black uppercase text-[var(--app-primary)] shadow-[0_0_15px_var(--app-glow)]`,children:[(0,m.jsx)(s,{size:11,className:`fill-current`}),` `,n(`home.hero.badge`)]}),(0,m.jsxs)(`h1`,{className:`home-home-title text-[1.45rem] font-black italic uppercase leading-none tracking-tight`,children:[n(`home.hero.title`),` `,(0,m.jsx)(`span`,{className:`bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary)] bg-clip-text text-transparent`,children:n(`home.hero.titleAccent`)})]}),(0,m.jsx)(`p`,{className:`mt-1.5 text-[8px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)]`,children:n(`home.hero.subtitle`)})]}),(0,m.jsxs)(`div`,{className:`home-home-panel-wrap relative w-full px-0.5 shrink-0`,children:[(0,m.jsx)(`div`,{className:`absolute -inset-2 rounded-[2rem] bg-[var(--app-primary-soft)] blur-2xl pointer-events-none`}),(0,m.jsx)(`div`,{className:`home-home-panel relative rounded-[1.8rem] border border-[var(--app-border)] bg-gradient-to-b from-[var(--app-primary-soft)] to-transparent p-1.5 backdrop-blur-sm shadow-[0_0_40px_var(--app-glow)]`,children:(0,m.jsxs)(`div`,{className:`home-home-panel-inner rounded-[1.4rem] border-2 border-[var(--app-border)] bg-[var(--app-surface)]/95 p-3 shadow-[inset_0_0_20px_var(--app-glow)]`,children:[(0,m.jsxs)(`div`,{className:`home-home-panel-header mb-2.5 flex items-center justify-between`,children:[(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`p`,{className:`text-[8px] font-black uppercase tracking-[0.25em] text-[var(--app-primary)]`,children:n(`home.panel.badge`)}),(0,m.jsx)(`h2`,{className:`home-home-panel-title mt-0.5 text-sm font-black uppercase italic tracking-tight text-[var(--app-text)]`,children:n(`home.panel.title`)})]}),(0,m.jsx)(i,{to:`/registro`,className:`home-home-camera-btn h-8 w-8 flex items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)] active:scale-90 transition-all`,children:(0,m.jsx)(a,{size:16})})]}),(0,m.jsxs)(i,{to:`/registro`,className:`home-home-preview relative block h-36 overflow-hidden rounded-[1.1rem] border border-[var(--app-border)] bg-[var(--app-surface)] active:scale-[0.97] transition-transform group`,children:[(0,m.jsx)(u,{src:`https://imag.bonviveur.com/presentacion-final-del-poke-bowl-de-pollo-y-verduras.webp`,alt:n(`home.panel.imageAlt`),className:`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105`}),(0,m.jsx)(`div`,{className:`absolute inset-x-0 z-20 h-[2px] animate-[scan_2.8s_ease-in-out_infinite] bg-red-500 shadow-[0_0_12px_#ef4444]`})]}),(0,m.jsxs)(`div`,{className:`home-home-macros grid grid-cols-2 gap-1.5 mt-2.5`,children:[(0,m.jsx)(_,{title:n(`home.macros.calories`),value:`450`,unit:`kcal`,color:`bg-emerald-400`,pct:`60%`}),(0,m.jsx)(_,{title:n(`home.macros.protein`),value:`28`,unit:`g`,color:`bg-cyan-400`,pct:`85%`}),(0,m.jsx)(_,{title:n(`home.macros.carbs`),value:`42`,unit:`g`,color:`bg-amber-300`,pct:`45%`}),(0,m.jsx)(_,{title:n(`home.macros.fat`),value:`12`,unit:`g`,color:`bg-rose-400`,pct:`30%`})]})]})})]}),(0,m.jsxs)(`div`,{className:`w-full shrink-0`,children:[(0,m.jsxs)(`div`,{className:`home-home-stats-grid grid grid-cols-3 gap-2 pb-2`,children:[(0,m.jsx)(g,{value:`IA`,label:n(`home.stats.analysis`),className:`home-home-stat`}),(0,m.jsx)(g,{value:`24/7`,label:n(`home.stats.coach`),className:`home-home-stat`}),(0,m.jsx)(g,{value:`PRO`,label:n(`home.stats.habits`),className:`home-home-stat`})]}),(0,m.jsx)(`div`,{className:`home-home-privacy text-center justify-center mt-1`,children:(0,m.jsx)(i,{to:`/privacy`,className:`text-[9px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] hover:text-[var(--app-primary)] transition-colors`,children:n(`home.privacy`)})})]})]})}),(0,m.jsxs)(`footer`,{className:`flex flex-col w-full shrink-0 bg-[var(--app-card)] z-20`,children:[(0,m.jsx)(`div`,{className:`home-home-cta-wrap px-5 pt-1 pb-6 w-full`,children:(0,m.jsxs)(i,{to:`/registro`,className:`home-home-cta group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-3 text-xs font-black uppercase tracking-widest text-[var(--app-surface)] shadow-[0_12px_30px_var(--app-glow)] active:scale-[0.98] transition-all`,children:[n(`home.cta`),(0,m.jsx)(o,{size:16,className:`transition-transform group-hover:translate-x-1`})]})}),(0,m.jsx)(`div`,{className:`home-home-nav-wrap h-[68px] w-full flex items-center justify-center border-t border-[var(--app-border)]`,children:(0,m.jsx)(c,{})})]})]}),(0,m.jsx)(`style`,{dangerouslySetInnerHTML:{__html:`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}})]})}function g({value:e,label:t,className:n=``}){return(0,m.jsxs)(`div`,{className:`rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-center ${n}`,children:[(0,m.jsx)(`span`,{className:`block text-base font-black italic text-[var(--app-primary)]`,children:e}),(0,m.jsx)(`span`,{className:`mt-0.5 block text-[8px] font-bold uppercase tracking-widest text-[var(--app-muted)]`,children:t})]})}function _({title:e,value:t,unit:n,color:r,pct:i}){return(0,m.jsxs)(`div`,{className:`rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5`,children:[(0,m.jsx)(`p`,{className:`text-[8px] font-black uppercase tracking-[0.18em] text-[var(--app-muted)]`,children:e}),(0,m.jsxs)(`div`,{className:`mt-0.5 flex items-baseline gap-0.5`,children:[(0,m.jsx)(`span`,{className:`text-base font-black italic text-[var(--app-text)]`,children:t}),(0,m.jsx)(`span`,{className:`text-[8px] font-black uppercase tracking-widest text-[var(--app-muted)]`,children:n})]}),(0,m.jsx)(`div`,{className:`mt-2 h-[3px] w-full overflow-hidden rounded-full bg-[var(--app-border)]/20`,children:(0,m.jsx)(`div`,{className:`h-full ${r}`,style:{width:i}})})]})}export{h as Home};