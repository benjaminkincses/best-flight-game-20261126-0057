export function createInput(target=window) {
  const held=new Set(),pressed=new Set();
  const controls=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyS','KeyP','KeyM','Enter']);
  target.addEventListener('keydown',e=>{if(controls.has(e.code)){e.preventDefault();if(!held.has(e.code))pressed.add(e.code);held.add(e.code);}});
  target.addEventListener('keyup',e=>held.delete(e.code));
  target.addEventListener('blur',()=>{held.clear();pressed.clear();});
  return {held,pressed,down:code=>held.has(code),consume:code=>{const yes=pressed.has(code);pressed.delete(code);return yes;},clearPresses:()=>pressed.clear()};
}
