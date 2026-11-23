/**
 * Runs before first paint (inline in <head>):
 *  - applies the saved theme (no flash of the wrong theme);
 *  - enables the reveal system only when JS runs and motion is allowed,
 *    with a 3 s safety net so content can never stay hidden.
 */
export const headScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.dataset.theme=t;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-reveal');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('js-reveal')},3000)}}catch(e){}})()`
