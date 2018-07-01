// 
//【scraping】
// 
// 概要: WebからHTMLを取得して情報を取得する関数
//      スクレイピンモジュールとしてcheerio-httpcliを利用
//      スクレイピン関数は個別のサービス毎に定義されており、それぞれ
//      関数の帰り値は
//      [日付, イベントタイトル, 詳細情報]
//      $ npm install --save cheerio-httpcli
//
// 更新履歴:
//         2018.06.30 新規作成
//
var client = require('cheerio-httpcli');
client.set('browser','chrome');

// 定数定義
const MAX_TITLE_LEN = 128;
const MAX_BODY_LEN = 512;

loft_asagaya("http://www.loft-prj.co.jp/schedule/lofta").then(function(ret){
    console.log(ret);
  });

async function trim(text){
    return text.replace(/\r?\n/g,"");
}

// URL毎の個別のスクレイピン関数
// 阿佐ヶ谷ロフト
// TOP:   http://www.loft-prj.co.jp/lofta/
// EVENT: http://www.loft-prj.co.jp/schedule/lofta
function loft_asagaya(url){
    return new Promise(function(resolve){
        var daies = [];
        var titles = [];
        var bodies = [];
        var ret = [];
        client.fetch(url, {}, function(err, $, res, body){
            // 表構造になっている
            // [日付,イベント名,イベント詳細] を配列に詰める
            // 開催の日付
            $('th[class=day]').each(function(){
                day = $(this).text();
                daies.push(day);
            })
            // イベント名
            $('div[class="event clearfix program1"] h3').each(function(){
                title = $(this).text();
                title = trim(title).then();
                titles.push(title);
            })
            // イベント詳細
            $('p[class="month_content"]').each(function(){
                body = $(this).text();
                body = trim(body).then();
                bodies.push(body);
            })
            for(var i = 0; i < daies.length; i++){
                ret.push([daies[i], titles[i], bodies[i]]);
            }
            resolve(ret);
        })
    });
} 

function loft_plusone(){
}