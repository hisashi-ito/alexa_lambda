// node 非同期/同期の確認
// 基本的にIF節等の非関数処理は同期処理でなされる。
'use strict';

function wa(a, b){
    setTimeout(() => {
        console.log("wa:"+(a+b)); 
     }, 5000);
}
var a = "A";
var b = "B";
wa(a,b);
// IF節は同期処理
if(a === "A"){
    setTimeout(() => {
        console.log("A"); 
     }, 10000);
}else{
    console.log("B");
};
console.log("C");
console.log("D");
// IF節は同期処理
if(b === "B"){
    console.log("E");
}else{
    console.log("F");
};
