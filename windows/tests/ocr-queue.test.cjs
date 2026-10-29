'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {OcrQueue}=require('../lib/ocr-queue.cjs');

test('background OCR drains more than 64 accepted images to the worker in FIFO order',async()=>{
 const processed=[],scheduled=[];
 const queue=new OcrQueue({enabled:()=>true,closing:()=>false,schedule:work=>scheduled.push(work),process:async id=>processed.push(id)});
 const ids=Array.from({length:70},(_,index)=>`image-${index}`);
 for(const id of ids)assert.equal(queue.enqueue(id),true,id);
 assert.equal(queue.enqueue(ids[0]),false);
 assert.equal(queue.size,70);
 assert.equal(scheduled.length,1);
 await scheduled.shift()();
 assert.deepEqual(processed,ids);
 assert.equal(queue.size,0);
});

test('background OCR gates disabled work and permits a retry after dequeue',async()=>{
 const scheduled=[],processed=[];
 const disabled=new OcrQueue({enabled:()=>false,closing:()=>false,schedule:work=>scheduled.push(work),process:async id=>processed.push(id)});
 assert.equal(disabled.enqueue('disabled-image'),false);
 assert.equal(disabled.size,0);
 let queue,retryAccepted=false;
 queue=new OcrQueue({enabled:()=>true,closing:()=>false,schedule:work=>scheduled.push(work),process:async id=>{processed.push(id);if(processed.length===1)retryAccepted=queue.enqueue(id);}});
 assert.equal(queue.enqueue('image-a'),true);
 assert.equal(queue.enqueue('image-a'),false);
 await scheduled.shift()();
 assert.equal(retryAccepted,true);
 assert.deepEqual(processed,['image-a','image-a']);
 assert.equal(queue.dequeue(),undefined);
});
