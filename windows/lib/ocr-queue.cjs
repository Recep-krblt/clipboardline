'use strict';
class OcrQueue {
 constructor(){this.items=[];this.pending=new Set();}
 enqueue(id){if(this.pending.has(id))return false;this.items.push(id);this.pending.add(id);return true;}
 dequeue(){const id=this.items.shift();if(id!==undefined)this.pending.delete(id);return id;}
 get size(){return this.items.length;}
}
module.exports={OcrQueue};
