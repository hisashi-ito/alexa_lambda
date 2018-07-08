'use strict';
function doSomething(callback){
    console.log("call doSomething");
    // call the callback function
    // function のポインタを渡す。
    callback('stuff', 'goes', 'here');
}
function foo(a,b,c){
    // I'm callback function
    console.log(a + " " + b + " " + c);
}
doSomething(foo);

var log = '';
// 関数定義
function step1(callback) {
    log += 'step1 ';
    callback();
}
function step2(callback) {
    log += 'step2 ';
    callback();
}
function step3(callback) {
    log += 'step3 ';
    callback();
}
function step4(callback) {
    log += 'step4 ';
    callback();
}

step1(function(){
    step2(function(){
        step3(function(){
            step4(function(){
                console.log('log:', log); //log: step1 step2 step3 step4
                console.log('done');
            })
        })
    })
});