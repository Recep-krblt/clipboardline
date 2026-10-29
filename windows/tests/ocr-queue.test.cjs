'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {OcrQueue}=require('../lib/ocr-queue.cjs');

test('background OCR keeps every new image queued when recognition falls behind',()=>{
 const queue=new OcrQueue();
 const ids=Array.from({length:70},(_,index)=>`image-${index}`);
 for(const id of ids)assert.equal(queue.enqueue(id),true,id);
 assert.equal(queue.size,70);
 assert.deepEqual(Array.from({length:70},()=>queue.dequeue()),ids);
 assert.equal(queue.size,0);
});

test('background OCR de-duplicates pending images and permits a later retry',()=>{
 const queue=new OcrQueue();
 assert.equal(queue.enqueue('image-a'),true);
 assert.equal(queue.enqueue('image-a'),false);
 assert.equal(queue.size,1);
 assert.equal(queue.dequeue(),'image-a');
 assert.equal(queue.enqueue('image-a'),true);
 assert.equal(queue.dequeue(),'image-a');
 assert.equal(queue.dequeue(),undefined);
});
