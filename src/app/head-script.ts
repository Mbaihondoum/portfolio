/**
 * Runs before first paint (inline in <head>):
 *  - applies the saved theme (no flash of the wrong theme);
 *  - skips the intro if already seen this session or motion is reduced;
 *  - enables the reveal system only when JS runs and motion is allowed,
 *    with a 3 s safety net so content can never stay hidden.
 */
export const headScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.dataset.theme=t;var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r||sessionStorage.getItem('intro-seen'))d.classList.add('intro-seen');if(!r){d.classList.add('js-reveal');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('js-reveal')},3000)}}catch(e){}})()`
