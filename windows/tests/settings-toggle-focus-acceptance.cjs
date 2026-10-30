'use strict';
const assert=require('node:assert/strict');

module.exports=async function settingsToggleFocusAcceptance({page,until,check}){
 const previous=await page.evaluate(()=>window.clipboardLine.state());
 const wasChecked=previous.settings.sounds===true;
 await page.evaluate(()=>window.clipboardLine.command('settings'));
 await until(()=>page.evaluate(()=>window.clipboardLine.state()),state=>state.view==='settings');
 const toggle=page.locator('input[data-setting="sounds"]');
 await toggle.waitFor({state:'visible'});
 await toggle.focus();
 await page.keyboard.press('Space');
 await until(()=>page.evaluate(()=>window.clipboardLine.state()),state=>state.settings.sounds===!wasChecked);
 const focusedSetting=await page.evaluate(()=>document.activeElement?.dataset?.setting||null);
 assert.equal(focusedSetting,'sounds','toggling a Settings checkbox with Space must retain focus after the settings save rerenders the UI');
 check('Settings checkbox preserves keyboard focus across its saved-state rerender');
 await page.keyboard.press('Space');
 await until(()=>page.evaluate(()=>window.clipboardLine.state()),state=>state.settings.sounds===wasChecked);
 await page.evaluate(()=>window.clipboardLine.command('library'));
 await until(()=>page.evaluate(()=>window.clipboardLine.state()),state=>state.view==='library');
};
