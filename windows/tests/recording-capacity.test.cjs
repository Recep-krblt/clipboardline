'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {Store}=require('../lib/model.cjs');
const poster=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
test('a recording rejected at the library item limit leaves no unreferenced managed media',async()=>{
 const directory=fs.mkdtempSync(path.join(__dirname,'.recording-capacity-'));
 try{
  const store=new Store(directory),source=path.join(directory,'synthetic-unique-recording.mp4');
  fs.writeFileSync(source,Buffer.from('synthetic unique source bytes 123'));
  store.putVideo=async file=>{const contents=fs.readFileSync(file),name=crypto.createHash('sha256').update(contents).digest('hex')+'.mp4';try{fs.writeFileSync(path.join(store.mediaDirectory,name),contents,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}return name;};
  store.data.items=Array.from({length:20000},(_,index)=>({id:'synthetic-'+index}));
  const before=fs.readdirSync(store.mediaDirectory);
  await assert.rejects(store.insertRecording({file:source,posterPNG:poster,durationMs:1000,width:100,height:100,audioTracks:0,videoCodec:'H264'}),/Library item limit reached/);
  assert.deepEqual(fs.readdirSync(store.mediaDirectory),before);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('a duplicate recording can still be recaptured at the library item limit',async()=>{
 const directory=fs.mkdtempSync(path.join(__dirname,'.recording-duplicate-capacity-'));
 try{
  const store=new Store(directory),source=path.join(directory,'synthetic-duplicate-recording.mp4');
  fs.writeFileSync(source,Buffer.from('synthetic duplicate source bytes 456'));
  store.putVideo=async file=>{const contents=fs.readFileSync(file),name=crypto.createHash('sha256').update(contents).digest('hex')+'.mp4';try{fs.writeFileSync(path.join(store.mediaDirectory,name),contents,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}return name;};
  const imported={file:source,posterPNG:poster,durationMs:1000,width:100,height:100,audioTracks:0,videoCodec:'H264'},original=await store.insertRecording(imported),now=Date.now();
  store.data.items.push(...Array.from({length:19999},(_,index)=>({id:'synthetic-text-'+index,kind:'text',text:'filler',url:'',title:'',name:'',pinned:false,folderIds:[],tags:[],note:'',retainedAt:null,lastCopiedAt:null,createdAt:now,updatedAt:now,trashedAt:null,hiddenFromShelf:false,annotations:[],crop:null,ocrText:''})));
  const repeated=await store.insertRecording(imported);
  assert.equal(repeated.id,original.id);
  assert.equal(store.data.items.length,20000);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});

